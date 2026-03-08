import { createState } from 'cms-ui/utilities';

export const lastShowPageRecordIdState = createState<string | null>({
  key: 'lastShowPageRecordIdState',
  defaultValue: null,
});
