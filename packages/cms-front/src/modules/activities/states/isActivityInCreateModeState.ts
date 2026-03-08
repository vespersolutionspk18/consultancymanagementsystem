import { createState } from 'cms-ui/utilities';
export const isActivityInCreateModeState = createState<boolean>({
  key: 'isActivityInCreateModeState',
  defaultValue: false,
});
