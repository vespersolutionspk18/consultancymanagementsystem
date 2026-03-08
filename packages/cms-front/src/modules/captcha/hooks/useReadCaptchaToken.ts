import { useRecoilCallback } from 'recoil';

import { captchaTokenState } from '@/captcha/states/captchaTokenState';
import { isDefined } from 'cms-shared/utils';

export const useReadCaptchaToken = () => {
  const readCaptchaToken = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const existingCaptchaToken = snapshot
          .getLoadable(captchaTokenState)
          .getValue();

        if (isDefined(existingCaptchaToken)) {
          return existingCaptchaToken;
        }
      },
    [],
  );

  return { readCaptchaToken };
};
