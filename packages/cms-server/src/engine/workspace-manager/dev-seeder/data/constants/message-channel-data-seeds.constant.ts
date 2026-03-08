import {
  MessageChannelSyncStage,
  MessageChannelType,
  MessageChannelVisibility,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

type MessageChannelDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isContactAutoCreationEnabled: boolean;
  type: MessageChannelType;
  connectedAccountId: string;
  handle: string;
  isSyncEnabled: boolean;
  visibility: MessageChannelVisibility;
  syncStage: MessageChannelSyncStage;
};

export const MESSAGE_CHANNEL_DATA_SEED_COLUMNS: (keyof MessageChannelDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'isContactAutoCreationEnabled',
    'type',
    'connectedAccountId',
    'handle',
    'isSyncEnabled',
    'visibility',
    'syncStage',
  ];

export const MESSAGE_CHANNEL_DATA_SEED_IDS = {} as Record<string, string>;

export const MESSAGE_CHANNEL_DATA_SEEDS: MessageChannelDataSeed[] = [];
