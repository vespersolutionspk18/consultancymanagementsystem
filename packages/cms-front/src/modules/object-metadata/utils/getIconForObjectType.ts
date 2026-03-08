import { IconCheckbox, type IconComponent, IconNotes } from 'cms-ui/display';
export const getIconForObjectType = (
  objectType: string,
): IconComponent | undefined => {
  switch (objectType) {
    case 'note':
      return IconNotes;
    case 'task':
      return IconCheckbox;
    default:
      return undefined;
  }
};
