import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilValue } from 'recoil';
import { CalendarStartDay } from 'cms-shared/constants';
import { type FirstDayOfTheWeek } from 'cms-shared/types';
import { type RelativeDateFilter } from 'cms-shared/utils';

export const useGetRelativeDateFilterWithUserTimezone = () => {
  const { userTimezone } = useUserTimezone();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const getRelativeDateFilterWithUserTimezone = (
    relativeDateFilter: RelativeDateFilter,
  ): RelativeDateFilter => {
    const userDefinedCalendarStartDay =
      CalendarStartDay[
        currentWorkspaceMember?.calendarStartDay ?? CalendarStartDay.SYSTEM
      ];
    const defaultSystemCalendarStartDay = detectCalendarStartDay();

    const resolvedCalendarStartDay = (
      userDefinedCalendarStartDay === CalendarStartDay[CalendarStartDay.SYSTEM]
        ? defaultSystemCalendarStartDay
        : userDefinedCalendarStartDay
    ) as FirstDayOfTheWeek;

    return {
      ...relativeDateFilter,
      timezone: userTimezone,
      firstDayOfTheWeek: resolvedCalendarStartDay,
    };
  };

  return {
    getRelativeDateFilterWithUserTimezone,
  };
};
