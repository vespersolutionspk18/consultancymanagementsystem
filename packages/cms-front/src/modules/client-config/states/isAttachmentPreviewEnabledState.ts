import { createState } from 'cms-ui/utilities';
export const isAttachmentPreviewEnabledState = createState<boolean>({
  key: 'isAttachmentPreviewEnabled',
  defaultValue: false,
});
