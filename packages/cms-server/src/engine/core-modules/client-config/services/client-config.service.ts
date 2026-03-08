import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { NodeEnvironment } from 'src/engine/core-modules/cms-config/interfaces/node-environment.interface';
import { SupportDriver } from 'src/engine/core-modules/cms-config/interfaces/support.interface';

import {
  type ClientAIModelConfig,
  type ClientConfig,
} from 'src/engine/core-modules/client-config/client-config.entity';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { PUBLIC_FEATURE_FLAGS } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';
import { convertCentsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-cents-to-billing-credits.util';
import {
  AI_MODELS,
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  ModelProvider,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class ClientConfigService {
  constructor(
    private cmsConfigService: CMSConfigService,
    private domainServerConfigService: DomainServerConfigService,
    private aiModelRegistryService: AiModelRegistryService,
  ) {}

  async getClientConfig(): Promise<ClientConfig> {
    const captchaProvider = this.cmsConfigService.get('CAPTCHA_DRIVER');
    const supportDriver = this.cmsConfigService.get('SUPPORT_DRIVER');
    const calendarBookingPageId = this.cmsConfigService.get(
      'CALENDAR_BOOKING_PAGE_ID',
    );

    const availableModels = this.aiModelRegistryService.getAvailableModels();

    const aiModels: ClientAIModelConfig[] = availableModels.map(
      (registeredModel) => {
        const builtInModel = AI_MODELS.find(
          (m) => m.modelId === registeredModel.modelId,
        );

        return {
          modelId: registeredModel.modelId,
          label: builtInModel?.label || registeredModel.modelId,
          provider: registeredModel.provider,
          nativeCapabilities: builtInModel?.nativeCapabilities,
          inputCostPer1kTokensInCredits: builtInModel
            ? convertCentsToBillingCredits(
                builtInModel.inputCostPer1kTokensInCents,
              )
            : 0,
          outputCostPer1kTokensInCredits: builtInModel
            ? convertCentsToBillingCredits(
                builtInModel.outputCostPer1kTokensInCents,
              )
            : 0,
          deprecated: builtInModel?.deprecated,
        };
      },
    );

    if (aiModels.length > 0) {
      const defaultSpeedModel =
        this.aiModelRegistryService.getDefaultSpeedModel();
      const defaultSpeedModelConfig = AI_MODELS.find(
        (m) => m.modelId === defaultSpeedModel?.modelId,
      );
      const defaultSpeedModelLabel =
        defaultSpeedModelConfig?.label ||
        defaultSpeedModel?.modelId ||
        'Default';

      const defaultPerformanceModel =
        this.aiModelRegistryService.getDefaultPerformanceModel();
      const defaultPerformanceModelConfig = AI_MODELS.find(
        (m) => m.modelId === defaultPerformanceModel?.modelId,
      );
      const defaultPerformanceModelLabel =
        defaultPerformanceModelConfig?.label ||
        defaultPerformanceModel?.modelId ||
        'Default';

      aiModels.unshift(
        {
          modelId: DEFAULT_SMART_MODEL,
          label: `Smart (${defaultPerformanceModelLabel})`,
          provider: ModelProvider.NONE,
          inputCostPer1kTokensInCredits: 0,
          outputCostPer1kTokensInCredits: 0,
        },
        {
          modelId: DEFAULT_FAST_MODEL,
          label: `Fast (${defaultSpeedModelLabel})`,
          provider: ModelProvider.NONE,
          inputCostPer1kTokensInCredits: 0,
          outputCostPer1kTokensInCredits: 0,
        },
      );
    }

    const clientConfig: ClientConfig = {
      appVersion: this.cmsConfigService.get('APP_VERSION'),
      billing: {
        isBillingEnabled: this.cmsConfigService.get('IS_BILLING_ENABLED'),
        billingUrl: this.cmsConfigService.get('BILLING_PLAN_REQUIRED_LINK'),
        trialPeriods: [
          {
            duration: this.cmsConfigService.get(
              'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: true,
          },
          {
            duration: this.cmsConfigService.get(
              'BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS',
            ),
            isCreditCardRequired: false,
          },
        ],
      },
      aiModels,
      authProviders: {
        google: this.cmsConfigService.get('AUTH_GOOGLE_ENABLED'),
        magicLink: false,
        password: this.cmsConfigService.get('AUTH_PASSWORD_ENABLED'),
        microsoft: this.cmsConfigService.get('AUTH_MICROSOFT_ENABLED'),
        sso: [],
      },
      signInPrefilled: this.cmsConfigService.get('SIGN_IN_PREFILLED'),
      isMultiWorkspaceEnabled: this.cmsConfigService.get(
        'IS_MULTIWORKSPACE_ENABLED',
      ),
      isEmailVerificationRequired: this.cmsConfigService.get(
        'IS_EMAIL_VERIFICATION_REQUIRED',
      ),
      defaultSubdomain: this.cmsConfigService.get('DEFAULT_SUBDOMAIN'),
      frontDomain: this.domainServerConfigService.getFrontUrl().hostname,
      support: {
        supportDriver: supportDriver ? supportDriver : SupportDriver.NONE,
        supportFrontChatId: this.cmsConfigService.get(
          'SUPPORT_FRONT_CHAT_ID',
        ),
      },
      sentry: {
        environment: this.cmsConfigService.get('SENTRY_ENVIRONMENT'),
        release: this.cmsConfigService.get('APP_VERSION'),
        dsn: this.cmsConfigService.get('SENTRY_FRONT_DSN'),
      },
      captcha: {
        provider: captchaProvider ? captchaProvider : undefined,
        siteKey: this.cmsConfigService.get('CAPTCHA_SITE_KEY'),
      },
      chromeExtensionId: this.cmsConfigService.get('CHROME_EXTENSION_ID'),
      api: {
        mutationMaximumAffectedRecords: this.cmsConfigService.get(
          'MUTATION_MAXIMUM_AFFECTED_RECORDS',
        ),
      },
      isAttachmentPreviewEnabled: this.cmsConfigService.get(
        'IS_ATTACHMENT_PREVIEW_ENABLED',
      ),
      analyticsEnabled: this.cmsConfigService.get('ANALYTICS_ENABLED'),
      canManageFeatureFlags:
        this.cmsConfigService.get('NODE_ENV') ===
          NodeEnvironment.DEVELOPMENT ||
        this.cmsConfigService.get('IS_BILLING_ENABLED'),
      publicFeatureFlags: PUBLIC_FEATURE_FLAGS,
      isMicrosoftMessagingEnabled: this.cmsConfigService.get(
        'MESSAGING_PROVIDER_MICROSOFT_ENABLED',
      ),
      isMicrosoftCalendarEnabled: this.cmsConfigService.get(
        'CALENDAR_PROVIDER_MICROSOFT_ENABLED',
      ),
      isGoogleMessagingEnabled: this.cmsConfigService.get(
        'MESSAGING_PROVIDER_GMAIL_ENABLED',
      ),
      isGoogleCalendarEnabled: this.cmsConfigService.get(
        'CALENDAR_PROVIDER_GOOGLE_ENABLED',
      ),
      isConfigVariablesInDbEnabled: this.cmsConfigService.get(
        'IS_CONFIG_VARIABLES_IN_DB_ENABLED',
      ),
      isImapSmtpCaldavEnabled: this.cmsConfigService.get(
        'IS_IMAP_SMTP_CALDAV_ENABLED',
      ),
      calendarBookingPageId: isNonEmptyString(calendarBookingPageId)
        ? calendarBookingPageId
        : undefined,
    };

    return clientConfig;
  }
}
