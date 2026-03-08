import { type ApprovedAccessDomain } from '~/generated/graphql';
import { createState } from 'cms-ui/utilities';

export const approvedAccessDomainsState = createState<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
