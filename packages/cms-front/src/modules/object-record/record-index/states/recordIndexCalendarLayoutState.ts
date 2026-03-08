import { createState } from 'cms-ui/utilities';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const recordIndexCalendarLayoutState = createState<ViewCalendarLayout>({
  key: 'recordIndexCalendarLayoutState',
  defaultValue: ViewCalendarLayout.MONTH,
});
