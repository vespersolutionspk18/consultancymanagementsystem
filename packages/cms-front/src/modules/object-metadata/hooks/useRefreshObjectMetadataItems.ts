import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { type ObjectPermissions } from 'cms-shared/types';
import { isDefined } from 'cms-shared/utils';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const client = useApolloClient();
  const refreshObjectMetadataItems = async () => {
    const objectMetadataItemsResult =
      await client.query<ObjectMetadataItemsQuery>({
        query: FIND_MANY_OBJECT_METADATA_ITEMS,
        variables: {},
        fetchPolicy,
      });

    const objectMetadataItems =
      mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: objectMetadataItemsResult.data,
      });

    return replaceObjectMetadataItemIfDifferent(objectMetadataItems);
  };

  const replaceObjectMetadataItemIfDifferent = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        toSetObjectMetadataItems: Omit<
          ObjectMetadataItem,
          'readableFields' | 'updatableFields'
        >[],
      ) => {
        const currentUserWorkspace = snapshot
          .getLoadable(currentUserWorkspaceState)
          .getValue();

        const objectPermissionsByObjectMetadataId = isDefined(
          currentUserWorkspace,
        )
          ? currentUserWorkspace.objectsPermissions.reduce(
              (acc, objectPermission) => {
                acc[objectPermission.objectMetadataId] = objectPermission;
                return acc;
              },
              {} as Record<
                string,
                ObjectPermissions & { objectMetadataId: string }
              >,
            )
          : ({} as Record<
              string,
              ObjectPermissions & { objectMetadataId: string }
            >);

        const newObjectMetadataItems = enrichObjectMetadataItemsWithPermissions(
          {
            objectMetadataItems: toSetObjectMetadataItems,
            objectPermissionsByObjectMetadataId,
          },
        );

        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            newObjectMetadataItems,
          ) &&
          newObjectMetadataItems.length > 0
        ) {
          set(objectMetadataItemsState, newObjectMetadataItems);
        }

        if (snapshot.getLoadable(shouldAppBeLoadingState).getValue() === true) {
          set(shouldAppBeLoadingState, false);
        }

        const wasRedirectDisabled = snapshot.getLoadable(isAppEffectRedirectEnabledState).getValue() === false;
        if (wasRedirectDisabled) {
          set(isAppEffectRedirectEnabledState, true);
        }

        return newObjectMetadataItems;
      },
    [],
  );

  return {
    refreshObjectMetadataItems,
  };
};
