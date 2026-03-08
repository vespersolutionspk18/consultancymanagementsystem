import { createState } from 'cms-ui/utilities';
export const emailThreadIdWhenEmailThreadWasClosedState = createState<
  string | null
>({
  key: 'emailThreadIdWhenEmailThreadWasClosedState',
  defaultValue: null,
});
