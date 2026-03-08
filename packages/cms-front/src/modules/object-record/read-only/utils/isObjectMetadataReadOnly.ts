import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectPermission } from '~/generated/graphql';
import { isDefined } from 'cms-shared/utils';

type IsObjectMetadataReadOnlyParams = {
  objectPermissions?: ObjectPermission;
  objectMetadataItem?: Pick<
    ObjectMetadataItem,
    'isUIReadOnly' | 'isRemote' | 'applicationId'
  >;
};

export const isObjectMetadataReadOnly = ({
  objectPermissions,
  objectMetadataItem,
}: IsObjectMetadataReadOnlyParams) => {
  return (
    (isDefined(objectPermissions) &&
      !objectPermissions.canUpdateObjectRecords) ||
    (isDefined(objectMetadataItem) &&
      (objectMetadataItem.isUIReadOnly || objectMetadataItem.isRemote))
  );
};
