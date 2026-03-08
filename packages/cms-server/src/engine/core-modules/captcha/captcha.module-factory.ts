import {
  type CaptchaDriverOptions,
  type CaptchaModuleOptions,
} from 'src/engine/core-modules/captcha/interfaces';
import { type CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

export const captchaModuleFactory = (
  cmsConfigService: CMSConfigService,
): CaptchaModuleOptions | undefined => {
  const driver = cmsConfigService.get('CAPTCHA_DRIVER');
  const siteKey = cmsConfigService.get('CAPTCHA_SITE_KEY');
  const secretKey = cmsConfigService.get('CAPTCHA_SECRET_KEY');

  if (!driver) {
    return;
  }

  if (!siteKey || !secretKey) {
    throw new Error('Captcha driver requires site key and secret key');
  }

  const captchaOptions: CaptchaDriverOptions = {
    siteKey,
    secretKey,
  };

  return {
    type: driver,
    options: captchaOptions,
  };
};
