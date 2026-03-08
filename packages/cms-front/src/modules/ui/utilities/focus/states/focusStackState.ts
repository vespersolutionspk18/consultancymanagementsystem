import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createState } from 'cms-ui/utilities';

export const focusStackState = createState<FocusStackItem[]>({
  key: 'focusStackState',
  defaultValue: [],
});
