type CalendarEventDataSeed = {
  id: string;
  title: string;
  isCanceled: boolean;
  isFullDay: boolean;
  startsAt: string;
  endsAt: string;
  externalCreatedAt: string;
  externalUpdatedAt: string;
  description: string;
  location: string;
  iCalUid: string;
  conferenceSolution: string;
  conferenceLinkPrimaryLinkLabel: string;
  conferenceLinkPrimaryLinkUrl: string;
};

export const CALENDAR_EVENT_DATA_SEED_COLUMNS: (keyof CalendarEventDataSeed)[] =
  [
    'id',
    'title',
    'isCanceled',
    'isFullDay',
    'startsAt',
    'endsAt',
    'externalCreatedAt',
    'externalUpdatedAt',
    'description',
    'location',
    'iCalUid',
    'conferenceSolution',
    'conferenceLinkPrimaryLinkLabel',
    'conferenceLinkPrimaryLinkUrl',
  ];

export const CALENDAR_EVENT_DATA_SEED_IDS = {} as Record<string, string>;

export const CALENDAR_EVENT_DATA_SEEDS: CalendarEventDataSeed[] = [];
