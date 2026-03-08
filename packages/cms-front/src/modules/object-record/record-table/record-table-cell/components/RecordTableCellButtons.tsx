import styled from '@emotion/styled';
import { type IconComponent } from 'cms-ui/display';
import { LightIconButtonGroup } from 'cms-ui/input';
import { MOBILE_VIEWPORT } from 'cms-ui/theme';
import { AnimatedContainer } from 'cms-ui/utilities';

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(1)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    position: relative;
    right: 7px;
  }
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
`;

type RecordTableCellButtonsProps = {
  onClick?: () => void;
  Icon: IconComponent;
}[];

export const RecordTableCellButtons = ({
  buttons,
}: {
  buttons: RecordTableCellButtonsProps;
}) => {
  return (
    <AnimatedContainer>
      <StyledButtonContainer>
        <LightIconButtonGroup size="small" iconButtons={buttons} />
      </StyledButtonContainer>
    </AnimatedContainer>
  );
};
