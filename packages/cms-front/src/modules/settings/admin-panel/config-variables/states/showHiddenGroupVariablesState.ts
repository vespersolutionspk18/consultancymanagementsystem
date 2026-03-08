import { createState } from 'cms-ui/utilities';

export const showHiddenGroupVariablesState = createState<boolean>({
  key: 'showHiddenGroupVariablesState',
  defaultValue: false,
});
