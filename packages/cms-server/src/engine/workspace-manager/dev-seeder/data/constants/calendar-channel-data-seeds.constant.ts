import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

type CalendarChannelDataSeed = {
  id: string;
  connectedAccountId: string;
  handle: string;
  visibility: CalendarChannelVisibility;
  isContactAutoCreationEnabled: boolean;
  isSyncEnabled: boolean;
};

export const CALENDAR_CHANNEL_DATA_SEED_COLUMNS: (keyof CalendarChannelDataSeed)[] =
  [
    'id',
    'connectedAccountId',
    'handle',
    'visibility',
    'isContactAutoCreationEnabled',
    'isSyncEnabled',
  ];

export const CALENDAR_CHANNEL_DATA_SEED_IDS = {} as Record<string, string>;

export const CALENDAR_CHANNEL_DATA_SEEDS: CalendarChannelDataSeed[] = [];
