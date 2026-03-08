import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/cms-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/cms-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildFavoriteStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  cmsStandardApplicationId,
}: Omit<CreateStandardIndexArgs<'favorite'>, 'context'>): Record<
  AllStandardObjectIndexName<'favorite'>,
  FlatIndexMetadata
> => ({
  forWorkspaceMemberIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'forWorkspaceMemberIdIndex',
      relatedFieldNames: ['forWorkspaceMember'],
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
  favoriteFolderIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'favoriteFolderIdIndex',
      relatedFieldNames: ['favoriteFolder'],
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
  workflowIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowIdIndex',
      relatedFieldNames: ['workflow'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
  workflowVersionIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowVersionIdIndex',
      relatedFieldNames: ['workflowVersion'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
  workflowRunIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'workflowRunIdIndex',
      relatedFieldNames: ['workflowRun'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
  taskIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'taskIdIndex',
      relatedFieldNames: ['task'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
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
  dashboardIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    context: {
      indexName: 'dashboardIdIndex',
      relatedFieldNames: ['dashboard'],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
    now,
  }),
});
