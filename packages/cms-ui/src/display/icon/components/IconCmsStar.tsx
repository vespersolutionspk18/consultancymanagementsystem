import { useTheme } from '@emotion/react';

import IconCMSStarRaw from '@assets/icons/cms-star.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconCMSStarProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconCMSStar = (props: IconCMSStarProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return <IconCMSStarRaw height={size} width={size} strokeWidth={stroke} />;
};
