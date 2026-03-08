import { type Sentry } from '~/generated/graphql';
import { createState } from 'cms-ui/utilities';

export const sentryConfigState = createState<Sentry | null>({
  key: 'sentryConfigState',
  defaultValue: null,
});
