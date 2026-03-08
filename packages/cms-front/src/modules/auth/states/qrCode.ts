import { createState } from 'cms-ui/utilities';

export const qrCodeState = createState<string | null>({
  key: 'qrCodeState',
  defaultValue: null,
});
