type ConnectedAccountDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lastSyncHistoryId: string;
  accountOwnerId: string;
  refreshToken: string;
  accessToken: string;
  provider: string;
  handle: string;
};

export const CONNECTED_ACCOUNT_DATA_SEED_COLUMNS: (keyof ConnectedAccountDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'lastSyncHistoryId',
    'accountOwnerId',
    'refreshToken',
    'accessToken',
    'provider',
    'handle',
  ];

export const CONNECTED_ACCOUNT_DATA_SEED_IDS = {} as Record<string, string>;

export const CONNECTED_ACCOUNT_DATA_SEEDS: ConnectedAccountDataSeed[] = [];
