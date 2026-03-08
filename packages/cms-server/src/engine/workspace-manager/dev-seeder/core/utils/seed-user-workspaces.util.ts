import { type QueryRunner } from 'typeorm';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { SEED_RMS_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const tableName = 'userWorkspace';

export const USER_WORKSPACE_DATA_SEED_IDS = {
  HASEEB: '20202020-9e3b-46d4-a556-88b9ddc2b035',
};

type SeedUserWorkspacesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedUserWorkspaces = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedUserWorkspacesArgs) => {
  let userWorkspaces: Pick<
    UserWorkspaceEntity,
    'id' | 'userId' | 'workspaceId'
  >[] = [];

  if (workspaceId === SEED_RMS_WORKSPACE_ID) {
    userWorkspaces = [
      {
        id: USER_WORKSPACE_DATA_SEED_IDS.HASEEB,
        userId: USER_DATA_SEED_IDS.HASEEB,
        workspaceId,
      },
    ];
  }

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['id', 'userId', 'workspaceId'])
    .orIgnore()
    .values(userWorkspaces)
    .execute();
};

type DeleteUserWorkspacesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const deleteUserWorkspaces = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: DeleteUserWorkspacesArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .delete()
    .from(`${schemaName}.${tableName}`)
    .where(`"${tableName}"."workspaceId" = :workspaceId`, {
      workspaceId,
    })
    .execute();
};
