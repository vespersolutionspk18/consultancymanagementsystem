import { type STANDARD_OBJECTS } from 'src/engine/workspace-manager/cms-standard-application/constants/standard-object.constant';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/cms-standard-application/types/all-standard-object-name.type';

export type AllStandardObjectView<T extends AllStandardObjectName> =
  (typeof STANDARD_OBJECTS)[T] extends { views: infer View } ? View : never;
