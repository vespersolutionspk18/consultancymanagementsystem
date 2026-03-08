import { createState } from 'cms-ui/utilities';
export const navigationMemorizedUrlState = createState<string>({
  key: 'navigationMemorizedUrlState',
  defaultValue: '/',
});
