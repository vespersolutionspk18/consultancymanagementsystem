import {
  StyledContainer,
  StyledDialog,
  StyledHeading,
} from './KeyboardShortcutMenuStyles';
import { t } from '@lingui/core/macro';
import { IconButton } from 'cms-ui/input';
import { IconX } from 'cms-ui/display';

type KeyboardMenuDialogProps = {
  onClose: () => void;
  children: React.ReactNode | React.ReactNode[];
};

export const KeyboardMenuDialog = ({
  onClose,
  children,
}: KeyboardMenuDialogProps) => {
  return (
    <StyledDialog>
      <StyledHeading>
        {t`Keyboard shortcuts`}
        <IconButton variant="tertiary" Icon={IconX} onClick={onClose} />
      </StyledHeading>
      <StyledContainer>{children}</StyledContainer>
    </StyledDialog>
  );
};
