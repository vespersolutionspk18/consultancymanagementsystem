import { ObjectRecordGroupByDateGranularity } from 'cms-shared/types';
import { isDefined } from 'cms-shared/utils';

export const isTimeRangeDateGranularity = (
  granularity?: ObjectRecordGroupByDateGranularity | null,
): boolean => {
  if (!isDefined(granularity)) return false;
  return [
    ObjectRecordGroupByDateGranularity.WEEK,
    ObjectRecordGroupByDateGranularity.MONTH,
    ObjectRecordGroupByDateGranularity.QUARTER,
    ObjectRecordGroupByDateGranularity.YEAR,
  ].includes(granularity);
};
