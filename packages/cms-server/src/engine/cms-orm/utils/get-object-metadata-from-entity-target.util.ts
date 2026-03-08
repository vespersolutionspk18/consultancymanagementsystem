import { type EntityTarget, type ObjectLiteral } from 'typeorm';

import { type WorkspaceInternalContext } from 'src/engine/cms-orm/interfaces/workspace-internal-context.interface';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  CMSORMException,
  CMSORMExceptionCode,
} from 'src/engine/cms-orm/exceptions/cms-orm.exception';

export const getObjectMetadataFromEntityTarget = <T extends ObjectLiteral>(
  entityTarget: EntityTarget<T>,
  internalContext: WorkspaceInternalContext,
): FlatObjectMetadata => {
  if (typeof entityTarget !== 'string') {
    throw new CMSORMException(
      'Entity target must be a string',
      CMSORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadataName = entityTarget;

  const objectMetadataId =
    internalContext.objectIdByNameSingular[objectMetadataName];

  if (!objectMetadataId) {
    throw new CMSORMException(
      `Object metadata for object "${objectMetadataName}" is missing ` +
        `in workspace "${internalContext.workspaceId}" ` +
        `with object metadata collection length: ${
          Object.keys(internalContext.objectIdByNameSingular).length
        }`,
      CMSORMExceptionCode.MALFORMED_METADATA,
    );
  }

  const objectMetadata =
    internalContext.flatObjectMetadataMaps.byId[objectMetadataId];

  if (!objectMetadata) {
    throw new CMSORMException(
      `Object metadata for object "${objectMetadataName}" (id: ${objectMetadataId}) is missing`,
      CMSORMExceptionCode.MALFORMED_METADATA,
    );
  }

  return objectMetadata;
};
