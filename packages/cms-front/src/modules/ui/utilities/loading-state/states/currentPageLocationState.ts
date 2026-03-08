import { createState } from 'cms-ui/utilities';
export const currentPageLocationState = createState<string>({
  key: 'currentPageLocationState',
  defaultValue: '',
});
