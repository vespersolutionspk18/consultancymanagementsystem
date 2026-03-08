import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from 'cms-shared/types';

export const hasObjectMetadataItemPositionField = (
  objectMetadataItem: ObjectMetadataItem,
) =>
  objectMetadataItem.fields.some(
    (field) => field.type === FieldMetadataType.POSITION,
  );
