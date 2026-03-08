import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'cms-ui/display';
import { TabButton } from 'cms-ui/input';

const StyledTabMoreButton = styled(TabButton)`
  height: ${({ theme }) => theme.spacing(10)};
`;

export const TabMoreButton = ({
  hiddenTabsCount,
  active,
  className,
}: {
  hiddenTabsCount: number;
  active: boolean;
  className?: string;
}) => {
  return (
    <StyledTabMoreButton
      id="tab-more-button"
      active={active}
      title={`+${hiddenTabsCount} ${t`More`}`}
      RightIcon={IconChevronDown}
      className={className}
    />
  );
};
