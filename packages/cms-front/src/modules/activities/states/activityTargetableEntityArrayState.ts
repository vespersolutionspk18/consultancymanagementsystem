import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { createState } from 'cms-ui/utilities';

export const activityTargetableEntityArrayState = createState<
  ActivityTargetableObject[]
>({
  key: 'activities/targetable-entity-array',
  defaultValue: [],
});
