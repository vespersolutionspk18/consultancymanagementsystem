import { atom } from 'recoil';
import { MOBILE_VIEWPORT } from 'cms-ui/theme';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const navigationDrawerExpandedMemorizedState = atom({
  key: 'navigationDrawerExpandedMemorized',
  default: !isMobile,
});
