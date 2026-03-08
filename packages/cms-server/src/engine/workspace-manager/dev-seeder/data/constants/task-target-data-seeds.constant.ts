type TaskTargetDataSeed = {
  id: string;
  taskId: string | null;
  personId: string | null;
  companyId: string | null;
  projectId: string | null;
};

export const TASK_TARGET_DATA_SEED_COLUMNS: (keyof TaskTargetDataSeed)[] = [
  'id',
  'taskId',
  'personId',
  'companyId',
  'projectId',
];

export const TASK_TARGET_DATA_SEEDS: TaskTargetDataSeed[] = [];

export const TASK_TARGET_DATA_SEEDS_MAP = new Map<string, TaskTargetDataSeed>();
