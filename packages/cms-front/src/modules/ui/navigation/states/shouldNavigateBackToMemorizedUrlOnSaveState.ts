import { createState } from 'cms-ui/utilities';

export const shouldNavigateBackToMemorizedUrlOnSaveState = createState<boolean>(
  {
    key: 'shouldNavigateBackToMemorizedUrlOnSaveState',
    defaultValue: false,
  },
);
