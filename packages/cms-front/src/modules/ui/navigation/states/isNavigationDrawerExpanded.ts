import { atom } from 'recoil';
import { MOBILE_VIEWPORT } from 'cms-ui/theme';
import { localStorageEffect } from '~/utils/recoil/localStorageEffect';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavigationDrawerExpandedState = atom({
  key: 'isNavigationDrawerExpanded',
  default: !isMobile,
  effects: [localStorageEffect()],
});
