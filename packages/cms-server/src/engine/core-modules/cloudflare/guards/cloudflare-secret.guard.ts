/* @license Enterprise */

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { timingSafeEqual } from 'crypto';

import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

@Injectable()
export class CloudflareSecretMatchGuard implements CanActivate {
  constructor(private readonly cmsConfigService: CMSConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest<Request>();

      const cloudflareWebhookSecret = this.cmsConfigService.get(
        'CLOUDFLARE_WEBHOOK_SECRET',
      );

      if (
        !cloudflareWebhookSecret ||
        (cloudflareWebhookSecret &&
          // @ts-expect-error legacy noImplicitAny
          (typeof request.headers['cf-webhook-auth'] === 'string' ||
            timingSafeEqual(
              // @ts-expect-error legacy noImplicitAny
              Buffer.from(request.headers['cf-webhook-auth']),
              Buffer.from(cloudflareWebhookSecret),
            )))
      ) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}
