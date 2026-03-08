import { createState } from 'cms-ui/utilities';

export const activeDropdownFocusIdState = createState<string | null>({
  key: 'activeDropdownFocusIdState',
  defaultValue: null,
});
