import { createState } from 'cms-ui/utilities';
export const canCreateActivityState = createState<boolean>({
  key: 'canCreateActivityState',
  defaultValue: false,
});
