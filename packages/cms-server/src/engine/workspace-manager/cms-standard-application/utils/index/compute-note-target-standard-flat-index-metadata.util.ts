import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/cms-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/cms-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildNoteTargetStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  cmsStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'noteTarget'>, 'context'>): Record<
  AllStandardObjectIndexName<'noteTarget'>,
  FlatIndexMetadata
> => ({
  noteIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'noteIdIndex',
      relatedFieldNames: ['note'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
  personIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'personIdIndex',
      relatedFieldNames: ['person'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
  companyIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'companyIdIndex',
      relatedFieldNames: ['company'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
  projectIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'projectIdIndex',
      relatedFieldNames: ['project'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
});
