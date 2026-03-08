import { type Decorator } from '@storybook/react';
import { IconsProvider } from 'cms-ui/display';

export const IconsProviderDecorator: Decorator = (Story) => {
  return (
    <IconsProvider>
      <Story />
    </IconsProvider>
  );
};
