import { createState } from 'cms-ui/utilities';
export const previousUrlState = createState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
