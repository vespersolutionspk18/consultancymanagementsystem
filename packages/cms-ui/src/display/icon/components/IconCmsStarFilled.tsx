import IconCMSStarFilledRaw from '@assets/icons/cms-star-filled.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { THEME_COMMON } from '@ui/theme';

type IconCMSStarFilledProps = Pick<IconComponentProps, 'size' | 'stroke'>;

const iconStrokeMd = THEME_COMMON.icon.stroke.md;

export const IconCMSStarFilled = (props: IconCMSStarFilledProps) => {
  const size = props.size ?? 24;
  const stroke = props.stroke ?? iconStrokeMd;

  return (
    <IconCMSStarFilledRaw height={size} width={size} strokeWidth={stroke} />
  );
};
