import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationV2Module } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-v2.module';
import { GlobalWorkspaceDataSourceModule } from 'src/engine/cms-orm/global-workspace-datasource/global-workspace-datasource.module';

import { CMSStandardApplicationService } from './services/cms-standard-application.service';

@Module({
  providers: [CMSStandardApplicationService],
  imports: [
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationV2Module,
    GlobalWorkspaceDataSourceModule,
  ],
  exports: [CMSStandardApplicationService],
})
export class CMSStandardApplicationModule {}
