import { type SettingsIntegrationCategory } from '@/settings/integrations/types/SettingsIntegrationCategory';

export const SETTINGS_INTEGRATION_ZAPIER_CATEGORY: SettingsIntegrationCategory =
  {
    key: 'zapier',
    title: 'With Zapier',
    hyperlinkText: 'See all zaps',
    hyperlink: 'https://zapier.com/apps/cms/integrations',
    integrations: [
      {
        from: { key: 'cms', image: '/images/integrations/cms-logo.svg' },
        to: { key: 'slack', image: '/images/integrations/slack-logo.png' },
        type: 'Use',
        text: 'Post to Slack when a company is updated',
        link: 'https://zapier.com/apps/cms/integrations/slack',
      },
      {
        from: { key: 'cal', image: '/images/integrations/cal-logo.png' },
        to: { key: 'cms', image: '/images/integrations/cms-logo.svg' },
        type: 'Use',
        text: 'Create a person when Cal.com event is created',
        link: 'https://zapier.com/apps/cms/integrations/calcom',
      },
      {
        from: {
          key: 'mailchimp',
          image: '/images/integrations/mailchimp-logo.png',
        },
        to: { key: 'cms', image: '/images/integrations/cms-logo.svg' },
        type: 'Use',
        text: 'Create a person when a MailChimp sub is created',
        link: 'https://zapier.com/apps/cms/integrations/mailchimp',
      },
      {
        from: { key: 'tally', image: '/images/integrations/tally-logo.png' },
        to: { key: 'cms', image: '/images/integrations/cms-logo.svg' },
        type: 'Use',
        text: 'Create a company when a Tally form is sent',
        link: 'https://zapier.com/apps/cms/integrations/tally',
      },
    ],
  };
