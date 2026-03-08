import { type IconComponent } from 'cms-ui/display';
import { createState } from 'cms-ui/utilities';

export const commandMenuPageInfoState = createState<{
  title?: string;
  Icon?: IconComponent;
  instanceId: string;
}>({
  key: 'command-menu/commandMenuPageInfoState',
  defaultValue: {
    title: undefined,
    Icon: undefined,
    instanceId: '',
  },
});
