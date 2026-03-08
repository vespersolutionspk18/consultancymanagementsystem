import { createState } from 'cms-ui/utilities';

export const previousDropdownFocusIdState = createState<string | null>({
  key: 'previousDropdownFocusIdState',
  defaultValue: null,
});
