import { capitalize } from 'cms-shared/utils';

export const getMergeManyRecordsMutationResponseField = (
  objectNamePlural: string,
): string => {
  return `merge${capitalize(objectNamePlural)}`;
};
