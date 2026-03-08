import { createState } from 'cms-ui/utilities';

export const calendarBookingPageIdState = createState<string | null>({
  key: 'calendarBookingPageIdState',
  defaultValue: null,
});
