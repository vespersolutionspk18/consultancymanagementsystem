import { createState } from 'cms-ui/utilities';
export const isEmailVerificationRequiredState = createState<boolean>({
  key: 'isEmailVerificationRequired',
  defaultValue: false,
});
