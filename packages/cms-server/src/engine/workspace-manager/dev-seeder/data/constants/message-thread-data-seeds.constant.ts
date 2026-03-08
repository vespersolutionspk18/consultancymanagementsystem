type MessageThreadDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export const MESSAGE_THREAD_DATA_SEED_COLUMNS: (keyof MessageThreadDataSeed)[] =
  ['id', 'createdAt', 'updatedAt', 'deletedAt'];

export const MESSAGE_THREAD_DATA_SEED_IDS = {} as Record<string, string>;

export const MESSAGE_THREAD_DATA_SEEDS: MessageThreadDataSeed[] = [];
