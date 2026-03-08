import { createState } from 'cms-ui/utilities';
export const isRequestingCaptchaTokenState = createState<boolean>({
  key: 'isRequestingCaptchaTokenState',
  defaultValue: false,
});
