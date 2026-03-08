import { createState } from 'cms-ui/utilities';
export const isGoogleMessagingEnabledState = createState<boolean>({
  key: 'isGoogleMessagingEnabled',
  defaultValue: false,
});
