import { Logger } from '@nestjs/common';

import { writeFileSync } from 'fs';

import { Command, CommandRunner } from 'nest-commander';
import { WorkspaceMigrationV2ExceptionCode } from 'cms-shared/metadata';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { AdditionalCacheDataMaps } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { computeCMSStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/cms-standard-application/utils/cms-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationV2Exception } from 'src/engine/workspace-manager/workspace-migration.exception';

@Command({
  name: 'workspace:compute-cms-standard-migration',
  description: 'Compute CMS standard workspace migration.',
})
export class ComputeCMSStandardWorkspaceMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(
    ComputeCMSStandardWorkspaceMigrationCommand.name,
  );

  constructor(
    private readonly workspaceMigrationBuildOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Starting compute CMS standard workspace migration...');

    // TODO: Implement migration logic here
    const workspaceId = '20202020-ef6f-4118-953c-2b027324b54a';
    const cmsStandardApplicationId = '20202020-5adb-4091-81b7-d5be86a8bdd2';
    const cmsStandardAllFlatEntityMaps =
      computeCMSStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        cmsStandardApplicationId,
      });

    writeFileSync(
      `${Date.now()}-all-flat-entity-maps.json`,
      JSON.stringify(cmsStandardAllFlatEntityMaps, null, 2),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationBuildOrchestratorService
        .buildWorkspaceMigration({
          buildOptions: {
            isSystemBuild: true,
          },
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatObjectMetadataMaps,
            },
            flatFieldMetadataMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatFieldMetadataMaps,
            },
            flatIndexMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatIndexMaps,
            },
            flatViewFieldMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatViewFieldMaps,
            },
            flatViewFilterMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatViewFilterMaps,
            },
            flatViewGroupMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatViewGroupMaps,
            },
            flatViewMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatViewMaps,
            },
            flatAgentMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatAgentMaps,
            },
            flatRoleMaps: {
              from: createEmptyFlatEntityMaps(),
              to: cmsStandardAllFlatEntityMaps.flatRoleMaps,
            },
          },
          additionalCacheDataMaps: {
            featureFlagsMap: {} as AdditionalCacheDataMaps['featureFlagsMap'],
          },
          workspaceId,
        })
        .catch((error) => {
          this.logger.error(error);
          throw new WorkspaceMigrationV2Exception(
            WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
            error.message,
          );
        });

    writeFileSync(
      `${Date.now()}validate-and-build-result.json`,
      JSON.stringify(validateAndBuildResult, null, 2),
    );

    this.logger.log(
      'Compute CMS standard workspace migration completed successfully.',
    );
  }
}
