type DashboardDataSeed = {
  id: string;
  title: string;
  pageLayoutId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  position: number;
};

export const DASHBOARD_DATA_SEED_COLUMNS: (keyof DashboardDataSeed)[] = [
  'id',
  'title',
  'pageLayoutId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'position',
];

export const DASHBOARD_DATA_SEED_IDS = {} as Record<string, string>;

export const getDashboardDataSeeds = (
  _workspaceId: string,
): DashboardDataSeed[] => {
  return [];
};
