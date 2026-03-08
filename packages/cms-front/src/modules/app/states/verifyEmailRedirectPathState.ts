import { createState } from 'cms-ui/utilities';

export const verifyEmailRedirectPathState = createState<string | undefined>({
  key: 'verifyEmailRedirectPathState',
  defaultValue: undefined,
});
