import { type ObjectRecordGroupByDateGranularity } from 'cms-shared/types';
import { type FirstDayOfTheWeek } from 'cms-shared/utils';

export type DateFieldGroupByDefinition = {
  granularity: ObjectRecordGroupByDateGranularity;
  weekStartDay?: FirstDayOfTheWeek;
  timeZone?: string;
};
