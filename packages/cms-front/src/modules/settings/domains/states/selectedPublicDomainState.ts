import { type PublicDomain } from '~/generated/graphql';
import { createState } from 'cms-ui/utilities';

export const selectedPublicDomainState = createState<PublicDomain | undefined>({
  key: 'selectedPublicDomainState',
  defaultValue: undefined,
});
