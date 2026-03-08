import { createState } from 'cms-ui/utilities';

export const workspaceBypassModeState = createState<boolean>({
  key: 'workspaceBypassModeState',
  defaultValue: false,
});
