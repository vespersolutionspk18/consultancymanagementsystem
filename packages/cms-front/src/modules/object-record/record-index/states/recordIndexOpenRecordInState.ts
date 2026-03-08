import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { createState } from 'cms-ui/utilities';

export const recordIndexOpenRecordInState = createState<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInState',
  defaultValue: ViewOpenRecordInType.SIDE_PANEL,
});
