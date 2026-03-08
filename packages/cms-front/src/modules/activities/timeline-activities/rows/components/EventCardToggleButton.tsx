import styled from '@emotion/styled';
import { IconButton } from 'cms-ui/input';
import { IconChevronDown, IconChevronUp } from 'cms-ui/display';

type EventCardToggleButtonProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const StyledButtonContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

export const EventCardToggleButton = ({
  isOpen,
  setIsOpen,
}: EventCardToggleButtonProps) => {
  return (
    <StyledButtonContainer>
      <IconButton
        Icon={isOpen ? IconChevronUp : IconChevronDown}
        onClick={() => setIsOpen(!isOpen)}
        size="small"
        variant="secondary"
      />
    </StyledButtonContainer>
  );
};
