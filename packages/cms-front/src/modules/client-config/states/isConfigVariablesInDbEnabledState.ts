import { createState } from 'cms-ui/utilities';
export const isConfigVariablesInDbEnabledState = createState<boolean>({
  key: 'isConfigVariablesInDbEnabled',
  defaultValue: false,
});
