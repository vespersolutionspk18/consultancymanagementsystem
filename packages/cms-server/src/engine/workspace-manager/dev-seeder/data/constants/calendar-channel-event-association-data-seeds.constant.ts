type CalendarChannelEventAssociationDataSeed = {
  id: string;
  calendarChannelId: string;
  calendarEventId: string;
  eventExternalId: string;
  recurringEventExternalId: string;
};

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_COLUMNS: (keyof CalendarChannelEventAssociationDataSeed)[] =
  [
    'id',
    'calendarChannelId',
    'calendarEventId',
    'eventExternalId',
    'recurringEventExternalId',
  ];

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEED_IDS = {} as Record<
  string,
  string
>;

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_DATA_SEEDS: CalendarChannelEventAssociationDataSeed[] =
  [];
