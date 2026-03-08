import { localStorageEffect } from '~/utils/recoil/localStorageEffect';
import { createState } from 'cms-ui/utilities';

export const lastVisitedViewPerObjectMetadataItemState = createState<Record<
  string,
  string
> | null>({
  key: 'lastVisitedViewPerObjectMetadataItemState',
  defaultValue: null,
  effects: [localStorageEffect()],
});
