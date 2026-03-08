import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { createState } from 'cms-ui/utilities';

export const coreViewsState = createState<CoreViewWithRelations[]>({
  key: 'coreViewsState',
  defaultValue: [],
});
