import { useRecoilValue } from 'recoil';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { type ObjectPermissions } from 'cms-shared/types';
import { isDefined } from 'cms-shared/utils';

type useObjectPermissionsReturnType = {
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};

export const useObjectPermissions = (): useObjectPermissionsReturnType => {
  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const objectsPermissions = currentUserWorkspace?.objectsPermissions;

  if (!isDefined(objectsPermissions)) {
    return {
      objectPermissionsByObjectMetadataId: {},
    };
  }

  const objectPermissionsByObjectMetadataId = objectsPermissions?.reduce(
    (
      acc: Record<string, ObjectPermissions & { objectMetadataId: string }>,
      objectPermission,
    ) => {
      acc[objectPermission.objectMetadataId] = objectPermission;
      return acc;
    },
    {},
  );

  return {
    objectPermissionsByObjectMetadataId,
  };
};
