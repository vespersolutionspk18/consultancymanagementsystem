import { createState } from 'cms-ui/utilities';
export const shouldAppBeLoadingState = createState<boolean>({
  key: 'shouldAppBeLoadingState',
  defaultValue: false,
});
