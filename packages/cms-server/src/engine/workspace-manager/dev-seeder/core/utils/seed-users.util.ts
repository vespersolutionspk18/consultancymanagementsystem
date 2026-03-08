import { type QueryRunner } from 'typeorm';

const tableName = 'user';

export const USER_DATA_SEED_IDS = {
  HASEEB: '20202020-9e3b-46d4-a556-88b9ddc2b034',
};

type SeedUsersArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
};

export const seedUsers = async ({ queryRunner, schemaName }: SeedUsersArgs) => {
  const users = [
    {
      id: USER_DATA_SEED_IDS.HASEEB,
      firstName: 'Haseeb',
      lastName: 'Iftikhar',
      email: 'h.iftikhar@nexusmindstech.com',
      passwordHash:
        '$2b$10$CSClNhb/8MRU3ZGwoUqLRu14UQPMfbxplkwm0N3nEYKbJEaMpfFaS', // h.iftikhar@nexusmindstech.com
      canImpersonate: true,
      canAccessFullAdminPanel: true,
      isEmailVerified: true,
    },
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'firstName',
      'lastName',
      'email',
      'passwordHash',
      'canImpersonate',
      'canAccessFullAdminPanel',
      'isEmailVerified',
    ])
    .orIgnore()
    .values(users)
    .execute();
};
