import { createState } from 'cms-ui/utilities';
export const isGoogleCalendarEnabledState = createState<boolean>({
  key: 'isGoogleCalendarEnabled',
  defaultValue: false,
});
