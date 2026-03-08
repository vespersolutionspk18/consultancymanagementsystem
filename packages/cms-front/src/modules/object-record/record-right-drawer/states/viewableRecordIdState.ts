import { createState } from 'cms-ui/utilities';

export const viewableRecordIdState = createState<string | null>({
  key: 'activities/viewable-record-id',
  defaultValue: null,
});
