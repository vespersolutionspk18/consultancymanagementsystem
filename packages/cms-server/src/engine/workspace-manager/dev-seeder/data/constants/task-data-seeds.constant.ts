type TaskDataSeed = {
  id: string;
  position: number;
  title: string;
  bodyV2Blocknote: string;
  bodyV2Markdown: string;
  status: string;
  dueAt: string | null;
  assigneeId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
};

export const TASK_DATA_SEED_COLUMNS: (keyof TaskDataSeed)[] = [
  'id',
  'position',
  'title',
  'bodyV2Blocknote',
  'bodyV2Markdown',
  'status',
  'dueAt',
  'assigneeId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const TASK_DATA_SEED_IDS = {} as Record<string, string>;

export const TASK_DATA_SEEDS: TaskDataSeed[] = [];
