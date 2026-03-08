import { type AllMetadataName } from 'cms-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

export type FlatEntityToCreateDeleteUpdate<T extends AllMetadataName> = {
  flatEntityToUpdate: MetadataFlatEntity<T>[];
  flatEntityToCreate: MetadataFlatEntity<T>[];
  flatEntityToDelete: MetadataFlatEntity<T>[];
};
