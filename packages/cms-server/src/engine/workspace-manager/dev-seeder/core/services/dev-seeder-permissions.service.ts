import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'cms-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { SEED_RMS_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { API_KEY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/api-key-data-seeds.constant';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/cms-standard-application/constants/standard-role.constant';

@Injectable()
export class DevSeederPermissionsService {
  private readonly logger = new Logger(DevSeederPermissionsService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly userRoleService: UserRoleService,
    private readonly objectPermissionService: ObjectPermissionService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly fieldPermissionService: FieldPermissionService,
    private readonly roleTargetService: RoleTargetService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  public async initPermissions({
    cmsStandardFlatApplication,
    workspaceId,
  }: {
    workspaceId: string;
    cmsStandardFlatApplication: FlatApplication;
  }) {
    const adminRole = await this.roleRepository.findOne({
      where: {
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
        workspaceId,
      },
    });

    if (!adminRole) {
      throw new Error(
        'Required roles not found. Make sure the permission sync has run.',
      );
    }

    await this.roleTargetService.create({
      createRoleTargetInput: {
        roleId: adminRole.id,
        targetId: API_KEY_DATA_SEED_IDS.ID_1,
        targetMetadataForeignKey: 'apiKeyId',
        applicationId: cmsStandardFlatApplication.id,
      },
      workspaceId,
    });

    let adminUserWorkspaceId: string | undefined;

    if (workspaceId === SEED_RMS_WORKSPACE_ID) {
      adminUserWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.HASEEB;
    }

    if (!adminUserWorkspaceId) {
      throw new Error(
        'Should never occur, no eligible user workspace for admin has been found',
      );
    }

    await this.userRoleService.assignRoleToManyUserWorkspace({
      workspaceId,
      userWorkspaceIds: [adminUserWorkspaceId],
      roleId: adminRole.id,
    });

    const memberRole = await this.roleService.createMemberRole({
      workspaceId,
      applicationId: cmsStandardFlatApplication.id,
    });

    await this.coreDataSource
      .getRepository(WorkspaceEntity)
      .update(workspaceId, {
        defaultRoleId: memberRole.id,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });
  }
}
