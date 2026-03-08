import { createState } from 'cms-ui/utilities';
export const currentMobileNavigationDrawerState = createState<
  'main' | 'settings'
>({
  key: 'currentMobileNavigationDrawerState',
  defaultValue: 'main',
});
