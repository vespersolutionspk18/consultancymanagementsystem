import { type FieldMetadataType } from 'cms-shared/types';
import { type FieldManifest } from 'cms-shared/application';

export const Field = <T extends FieldMetadataType>(
  _: FieldManifest<T>,
): PropertyDecorator => {
  return () => {};
};
