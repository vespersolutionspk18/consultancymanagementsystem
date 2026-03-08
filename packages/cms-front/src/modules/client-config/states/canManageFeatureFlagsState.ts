import { createState } from 'cms-ui/utilities';
export const canManageFeatureFlagsState = createState<boolean>({
  key: 'canManageFeatureFlagsState',
  defaultValue: false,
});
