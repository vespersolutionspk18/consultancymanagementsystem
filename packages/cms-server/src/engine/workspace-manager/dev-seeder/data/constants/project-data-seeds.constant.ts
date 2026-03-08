type ProjectDataSeed = {
  id: string;
  name: string;
  amountAmountMicros: number;
  amountCurrencyCode: string;
  submissionDate: Date;
  stage: string;
  position: number;
  pointOfContactId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
};

export const OPPORTUNITY_DATA_SEED_COLUMNS: (keyof ProjectDataSeed)[] = [
  'id',
  'name',
  'amountAmountMicros',
  'amountCurrencyCode',
  'submissionDate',
  'stage',
  'position',
  'pointOfContactId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const OPPORTUNITY_DATA_SEED_IDS = {} as Record<string, string>;

export const OPPORTUNITY_DATA_SEEDS: ProjectDataSeed[] = [];
