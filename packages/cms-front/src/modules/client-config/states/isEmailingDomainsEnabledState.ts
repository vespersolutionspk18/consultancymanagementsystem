import { createState } from 'cms-ui/utilities';

export const isEmailingDomainsEnabledState = createState<boolean>({
  key: 'isEmailingDomainsEnabled',
  defaultValue: false,
});
