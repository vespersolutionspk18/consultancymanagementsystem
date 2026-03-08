import { createState } from 'cms-ui/utilities';
export const isLoadingTokensFromExtensionState = createState<boolean | null>({
  key: 'isLoadingTokensFromExtensionState',
  defaultValue: null,
});
