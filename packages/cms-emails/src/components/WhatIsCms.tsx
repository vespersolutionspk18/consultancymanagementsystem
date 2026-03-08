import { type I18n } from '@lingui/core';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';

type WhatIsCMSProps = {
  i18n: I18n;
};

export const WhatIsCMS = ({ i18n }: WhatIsCMSProps) => {
  return (
    <>
      <SubTitle value={i18n._('What is CMS?')} />
      <MainText>
        {i18n._(
          "It's a CRM, a software to help businesses manage their customer data and relationships efficiently.",
        )}
      </MainText>
    </>
  );
};
