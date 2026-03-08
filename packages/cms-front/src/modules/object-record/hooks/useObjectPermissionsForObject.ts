import { getObjectPermissionsForObject } from '~/modules/object-metadata/utils/getObjectPermissionsForObject';

import { useMemo } from 'react';
import { type ObjectPermissions } from 'cms-shared/types';
import { useObjectPermissions } from './useObjectPermissions';

export const useObjectPermissionsForObject = (
  objectMetadataId: string,
): ObjectPermissions & { objectMetadataId: string } => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  return useMemo(() => {
    return getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataId,
    );
  }, [objectPermissionsByObjectMetadataId, objectMetadataId]);
};
