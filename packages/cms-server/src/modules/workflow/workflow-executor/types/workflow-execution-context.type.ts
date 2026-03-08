import { type ActorMetadata } from 'cms-shared/types';

import { type RolePermissionConfig } from 'src/engine/cms-orm/types/role-permission-config';

export type WorkflowExecutionContext = {
  isActingOnBehalfOfUser: boolean;
  initiator: ActorMetadata;
  rolePermissionConfig: RolePermissionConfig;
};
