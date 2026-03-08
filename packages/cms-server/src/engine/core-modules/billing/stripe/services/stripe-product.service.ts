/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import type Stripe from 'stripe';

import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

@Injectable()
export class StripeProductService {
  protected readonly logger = new Logger(StripeProductService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly cmsConfigService: CMSConfigService,
    private readonly stripeSDKService: StripeSDKService,
  ) {
    if (!this.cmsConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }
    this.stripe = this.stripeSDKService.getStripe(
      this.cmsConfigService.get('BILLING_STRIPE_API_KEY'),
    );
  }

  async getAllProducts() {
    const products = await this.stripe.products.list({
      active: true,
      limit: 100,
    });

    return products.data;
  }
}
