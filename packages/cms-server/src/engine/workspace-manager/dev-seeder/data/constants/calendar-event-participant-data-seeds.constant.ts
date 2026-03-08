import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

export type CalendarEventParticipantDataSeed = {
  id: string;
  calendarEventId: string;
  handle: string;
  displayName: string;
  isOrganizer: boolean;
  responseStatus: CalendarEventParticipantResponseStatus;
  personId: string | null;
  workspaceMemberId: string | null;
};

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_COLUMNS = [
  'id',
  'calendarEventId',
  'handle',
  'displayName',
  'isOrganizer',
  'responseStatus',
  'personId',
  'workspaceMemberId',
];

export const CALENDAR_EVENT_PARTICIPANT_DATA_SEED_IDS = {} as Record<
  string,
  string
>;

export const getCalendarEventParticipantDataSeeds = (
  _workspaceId: string,
): CalendarEventParticipantDataSeed[] => {
  return [];
};
