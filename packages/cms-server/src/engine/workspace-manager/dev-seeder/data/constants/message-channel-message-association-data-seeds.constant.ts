import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

type MessageChannelMessageAssociationDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  messageExternalId: string;
  messageThreadExternalId: string;
  messageChannelId: string;
  messageId: string;
  direction: MessageDirection;
};

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_COLUMNS: (keyof MessageChannelMessageAssociationDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'messageExternalId',
    'messageThreadExternalId',
    'messageChannelId',
    'messageId',
    'direction',
  ];

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_IDS = {} as Record<
  string,
  string
>;

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEEDS: MessageChannelMessageAssociationDataSeed[] =
  [];
