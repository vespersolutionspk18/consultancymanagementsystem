import { createState } from 'cms-ui/utilities';

export const isImapSmtpCaldavEnabledState = createState<boolean>({
  key: 'isImapSmtpCaldavEnabled',
  defaultValue: false,
});
