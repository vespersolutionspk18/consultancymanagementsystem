import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsPath } from 'cms-shared/types';
import { getSettingsPath } from 'cms-shared/utils';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconPlus } from 'cms-ui/display';
import { Button } from 'cms-ui/input';
import { Section } from 'cms-ui/layout';
import { UndecoratedLink } from 'cms-ui/navigation';
import { isObjectMetadataSettingsReadOnly } from '@/object-record/read-only/utils/isObjectMetadataSettingsReadOnly';
import { useRecoilValue } from 'recoil';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type ObjectFieldsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const readonly = isObjectMetadataSettingsReadOnly({
    objectMetadataItem,
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });

  const { t } = useLingui();
  const objectLabelSingular = objectMetadataItem.labelSingular;

  return (
    <Section>
      <H2Title
        title={t`Fields`}
        description={t`Customise the fields available in the ${objectLabelSingular} views.`}
      />
      <SettingsObjectFieldTable
        objectMetadataItem={objectMetadataItem}
        mode="view"
      />
      {!readonly && (
        <StyledDiv>
          <UndecoratedLink
            to={getSettingsPath(SettingsPath.ObjectNewFieldSelect, {
              objectNamePlural: objectMetadataItem.namePlural,
            })}
          >
            <Button
              Icon={IconPlus}
              title={t`Add Field`}
              size="small"
              variant="secondary"
            />
          </UndecoratedLink>
        </StyledDiv>
      )}
    </Section>
  );
};
