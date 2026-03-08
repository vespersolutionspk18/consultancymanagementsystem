import { WorkspaceActivationStatus } from 'cms-shared/workspace';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const WORKSPACE_FIELDS_TO_SEED = [
  'id',
  'displayName',
  'subdomain',
  'inviteHash',
  'logo',
  'activationStatus',
  'isTwoFactorAuthenticationEnforced',
  'version',
  'workspaceCustomApplicationId',
] as const satisfies (keyof WorkspaceEntity)[];

export type CreateWorkspaceInput = Pick<
  WorkspaceEntity,
  (typeof WORKSPACE_FIELDS_TO_SEED)[number]
>;

export const SEED_RMS_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

export type SeededWorkspacesIds = typeof SEED_RMS_WORKSPACE_ID;

export const SEEDER_CREATE_WORKSPACE_INPUT = {
  [SEED_RMS_WORKSPACE_ID]: {
    id: SEED_RMS_WORKSPACE_ID,
    displayName: 'RMS',
    subdomain: 'rms',
    inviteHash: 'rms-invite-hash',
    logo: '',
    activationStatus: WorkspaceActivationStatus.PENDING_CREATION, // will be set to active after default role creation
    isTwoFactorAuthenticationEnforced: false,
  },
} as const satisfies Record<
  SeededWorkspacesIds,
  Omit<CreateWorkspaceInput, 'version' | 'workspaceCustomApplicationId'>
>;
