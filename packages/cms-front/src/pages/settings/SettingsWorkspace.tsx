import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { NameField } from '@/settings/workspace/components/NameField';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'cms-shared/types';
import { getSettingsPath } from 'cms-shared/utils';
import { H2Title } from 'cms-ui/display';
import { Section } from 'cms-ui/layout';

export const SettingsWorkspace = () => {
  const { t } = useLingui();
  return (
    <SubMenuTopBarContainer
      title={t`General`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`General` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Picture`} />
          <WorkspaceLogoUploader />
        </Section>
        <Section>
          <H2Title title={t`Name`} description={t`Name of your workspace`} />
          <NameField />
        </Section>

        <Section>
          <DeleteWorkspace />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
