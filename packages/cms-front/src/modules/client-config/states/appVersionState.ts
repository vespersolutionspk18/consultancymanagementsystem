import { createState } from 'cms-ui/utilities';

export const appVersionState = createState<string | undefined>({
  key: 'appVersion',
  defaultValue: undefined,
});
