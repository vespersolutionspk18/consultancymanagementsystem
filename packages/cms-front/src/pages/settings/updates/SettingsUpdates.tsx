import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'cms-shared/types';
import { getSettingsPath } from 'cms-shared/utils';
import { H2Title, IconTransform } from 'cms-ui/display';
import { Section } from 'cms-ui/layout';

const StyledCardLink = styled.a`
  text-decoration: none;
`;

export const SettingsUpdates = () => {
  const theme = useTheme();

  return (
    <SubMenuTopBarContainer
      title={t`Updates`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.Updates),
        },
        { children: t`Updates` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Releases`}
            description={t`Check out our latest releases`}
          />
          <StyledCardLink
            href="https://cms.com/releases"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SettingsCard
              Icon={
                <IconTransform
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              }
              title={t`Read changelog`}
            />
          </StyledCardLink>
        </Section>

        <Section>
          <H2Title
            title={t`Early access`}
            description={t`Try our upcoming features. Note they are still in beta. Please bear with us and report any issues you find.`}
          />
          <SettingsLabContent />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
