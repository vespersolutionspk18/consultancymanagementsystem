import { createState } from 'cms-ui/utilities';

export const isMergeInProgressState = createState<boolean>({
  key: 'isMergeInProgress',
  defaultValue: false,
});
