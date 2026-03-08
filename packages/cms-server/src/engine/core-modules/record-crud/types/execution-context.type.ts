import { type ActorMetadata } from 'cms-shared/types';

import { type RolePermissionConfig } from 'src/engine/cms-orm/types/role-permission-config';

export type RecordCrudExecutionContext = {
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
};

export type CreateRecordExecutionContext = RecordCrudExecutionContext & {
  createdBy?: ActorMetadata;
};
