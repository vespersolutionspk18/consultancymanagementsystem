import { type ObjectsPermissions } from 'cms-shared/types';
import { type PermissionFlagType } from 'cms-shared/constants';

export type UserWorkspacePermissions = {
  permissionFlags: Record<PermissionFlagType, boolean>;
  objectsPermissions: ObjectsPermissions;
};
