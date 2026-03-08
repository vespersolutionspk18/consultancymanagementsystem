import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/cms-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/cms-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageChannelMessageAssociationStandardFlatIndexMetadatas =
  ({
    now,
    objectName,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    cmsStandardApplicationId,
  }: Omit<
    CreateStandardIndexArgs<'messageChannelMessageAssociation'>,
    'context'
  >): Record<
    AllStandardObjectIndexName<'messageChannelMessageAssociation'>,
    FlatIndexMetadata
  > => ({
    messageChannelIdIndex: createStandardIndexFlatMetadata({
      objectName,
      workspaceId,
      context: {
        indexName: 'messageChannelIdIndex',
        relatedFieldNames: ['messageChannel'],
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      cmsStandardApplicationId,
      now,
    }),
    messageIdIndex: createStandardIndexFlatMetadata({
      objectName,
      workspaceId,
      context: {
        indexName: 'messageIdIndex',
        relatedFieldNames: ['message'],
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      cmsStandardApplicationId,
      now,
    }),
    messageChannelIdMessageIdUniqueIndex: createStandardIndexFlatMetadata({
      objectName,
      workspaceId,
      context: {
        indexName: 'messageChannelIdMessageIdUniqueIndex',
        relatedFieldNames: ['messageChannel', 'message'],
        isUnique: true,
        indexWhereClause: '"deletedAt" IS NULL',
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      cmsStandardApplicationId,
      now,
    }),
  });
