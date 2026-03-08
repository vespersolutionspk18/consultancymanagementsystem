import { isDefined } from 'cms-shared/utils';
import { type FullNameMetadata } from 'cms-shared/types';

export const computeDisplayName = (
  name: FullNameMetadata | null | undefined,
) => {
  if (!name) {
    return '';
  }

  return Object.values(name).filter(isDefined).join(' ');
};
