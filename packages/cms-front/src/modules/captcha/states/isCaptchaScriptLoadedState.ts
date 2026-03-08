import { createState } from 'cms-ui/utilities';
export const isCaptchaScriptLoadedState = createState<boolean>({
  key: 'isCaptchaScriptLoadedState',
  defaultValue: false,
});
