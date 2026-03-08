import { type Billing } from '~/generated/graphql';
import { createState } from 'cms-ui/utilities';

export const billingState = createState<Billing | null>({
  key: 'billingState',
  defaultValue: null,
});
