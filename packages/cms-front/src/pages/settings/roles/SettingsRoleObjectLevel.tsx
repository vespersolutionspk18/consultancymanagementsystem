import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectForm } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'cms-shared/types';
import { getSettingsPath, isDefined } from 'cms-shared/utils';

export const SettingsRoleObjectLevel = () => {
  const { roleId, objectMetadataId } = useParams();

  if (!isDefined(roleId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

  if (!isDefined(objectMetadataId)) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.RoleDetail, { roleId })} />
    );
  }

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRolePermissionsObjectLevelObjectForm
        roleId={roleId}
        objectMetadataId={objectMetadataId}
      />
    </>
  );
};
