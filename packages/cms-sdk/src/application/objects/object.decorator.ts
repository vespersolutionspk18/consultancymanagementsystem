import { type ObjectManifest } from 'cms-shared/application';

type ObjectMetadataOptions = Omit<ObjectManifest, 'fields'>;

export const Object = (_: ObjectMetadataOptions): ClassDecorator => {
  return () => {};
};
