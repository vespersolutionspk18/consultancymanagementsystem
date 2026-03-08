import { isDefined } from 'cms-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type CMSORMException,
  CMSORMExceptionCode,
} from 'src/engine/cms-orm/exceptions/cms-orm.exception';

interface DuplicateKeyErrorWithMetadata extends CMSORMException {
  conflictingRecordId?: string;
  conflictingObjectNameSingular?: string;
}

export const cmsORMGraphqlApiExceptionHandler = (
  error: CMSORMException,
) => {
  switch (error.code) {
    case CMSORMExceptionCode.DUPLICATE_ENTRY_DETECTED: {
      const duplicateKeyError: DuplicateKeyErrorWithMetadata = error;

      const extensions: Record<string, unknown> = {
        userFriendlyMessage: error.userFriendlyMessage,
        ...(isDefined(duplicateKeyError.conflictingRecordId) &&
        isDefined(duplicateKeyError.conflictingObjectNameSingular)
          ? {
              conflictingRecordId: duplicateKeyError.conflictingRecordId,
              conflictingObjectNameSingular:
                duplicateKeyError.conflictingObjectNameSingular,
            }
          : {}),
      };

      throw new UserInputError(error.message, extensions);
    }

    case CMSORMExceptionCode.INVALID_INPUT:
    case CMSORMExceptionCode.CONNECT_RECORD_NOT_FOUND:
    case CMSORMExceptionCode.CONNECT_NOT_ALLOWED:
    case CMSORMExceptionCode.CONNECT_UNIQUE_CONSTRAINT_ERROR:
    case CMSORMExceptionCode.TOO_MANY_RECORDS_TO_UPDATE:
      throw new UserInputError(error.message, {
        userFriendlyMessage: error.userFriendlyMessage,
      });
    default: {
      throw error;
    }
  }
};
