import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

type WorkspaceMemberDataSeed = {
  id: string;
  nameFirstName: string;
  nameLastName: string;
  locale: string;
  colorScheme: string;
  userEmail: string;
  userId: string;
};

export const WORKSPACE_MEMBER_DATA_SEED_COLUMNS: (keyof WorkspaceMemberDataSeed)[] =
  [
    'id',
    'nameFirstName',
    'nameLastName',
    'locale',
    'colorScheme',
    'userEmail',
    'userId',
  ];

export const WORKSPACE_MEMBER_DATA_SEED_IDS = {
  HASEEB: '20202020-0687-4c41-b707-ed1bfca972a7',
};

const workspaceMembers: WorkspaceMemberDataSeed[] = [
  {
    id: WORKSPACE_MEMBER_DATA_SEED_IDS.HASEEB,
    nameFirstName: 'Haseeb',
    nameLastName: 'Iftikhar',
    locale: 'en',
    colorScheme: 'Light',
    userEmail: 'h.iftikhar@nexusmindstech.com',
    userId: USER_DATA_SEED_IDS.HASEEB,
  },
];

export const WORKSPACE_MEMBER_DATA_SEEDS: WorkspaceMemberDataSeed[] =
  workspaceMembers;

export const getWorkspaceMemberDataSeeds = (
  _workspaceId: string,
): WorkspaceMemberDataSeed[] => {
  return workspaceMembers;
};
