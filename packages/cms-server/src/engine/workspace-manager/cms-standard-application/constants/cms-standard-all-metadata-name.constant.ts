import { type AllMetadataName } from 'cms-shared/metadata';

export const CMS_STANDARD_ALL_METADATA_NAME = [
  'index',
  'objectMetadata',
  'fieldMetadata',
  'viewField',
  'viewFilter',
  'viewGroup',
  'view',
  'role',
  'agent',
] as const satisfies AllMetadataName[];
