type MessageDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  receivedAt: Date;
  text: string;
  subject: string;
  messageThreadId: string;
  headerMessageId: string;
};

export const MESSAGE_DATA_SEED_COLUMNS: (keyof MessageDataSeed)[] = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'receivedAt',
  'text',
  'subject',
  'messageThreadId',
  'headerMessageId',
];

export const MESSAGE_DATA_SEED_IDS = {} as Record<string, string>;

export const MESSAGE_DATA_SEEDS: MessageDataSeed[] = [];
