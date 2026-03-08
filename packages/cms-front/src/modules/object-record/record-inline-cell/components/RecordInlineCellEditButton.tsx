import styled from '@emotion/styled';
import { type IconComponent } from 'cms-ui/display';
import { FloatingIconButton } from 'cms-ui/input';
import { AnimatedContainer } from 'cms-ui/utilities';

const StyledInlineCellButtonContainer = styled.div`
  align-items: center;
  display: flex;
`;

export const RecordInlineCellButton = ({
  Icon,
  onClick,
}: {
  Icon: IconComponent;
  onClick?: () => void;
}) => {
  return (
    <AnimatedContainer>
      <StyledInlineCellButtonContainer onClick={onClick}>
        <FloatingIconButton
          size="small"
          Icon={Icon}
          data-testid="inline-cell-edit-mode-container"
        />
      </StyledInlineCellButtonContainer>
    </AnimatedContainer>
  );
};
