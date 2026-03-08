import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import { isDefined } from 'cms-shared/utils';

import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';
import { GlobalWorkspaceDataSource } from 'src/engine/cms-orm/global-workspace-datasource/global-workspace-datasource';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

@Injectable()
export class GlobalWorkspaceDataSourceService
  implements OnModuleInit, OnApplicationShutdown
{
  private globalWorkspaceDataSource: GlobalWorkspaceDataSource | null = null;
  private globalWorkspaceDataSourceReplica: GlobalWorkspaceDataSource | null =
    null;

  constructor(
    private readonly cmsConfigService: CMSConfigService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async onModuleInit(): Promise<void> {
    this.globalWorkspaceDataSource = new GlobalWorkspaceDataSource(
      {
        url: this.cmsConfigService.get('PG_DATABASE_URL'),
        type: 'postgres',
        logging: this.cmsConfigService.getLoggingConfig(),
        entities: [],
        ssl: this.cmsConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
        poolSize: this.cmsConfigService.get('PG_POOL_MAX_CONNECTIONS'),
        extra: {
          query_timeout: this.cmsConfigService.get(
            'PG_DATABASE_PRIMARY_TIMEOUT_MS',
          ),
          idleTimeoutMillis: this.cmsConfigService.get(
            'PG_POOL_IDLE_TIMEOUT_MS',
          ),
          allowExitOnIdle: this.cmsConfigService.get(
            'PG_POOL_ALLOW_EXIT_ON_IDLE',
          ),
        },
      },
      this.workspaceEventEmitter,
    );

    await this.globalWorkspaceDataSource.initialize();

    const shouldInitializeReplicaDataSource = isDefined(
      this.cmsConfigService.get('PG_DATABASE_REPLICA_URL'),
    );

    if (shouldInitializeReplicaDataSource) {
      this.globalWorkspaceDataSourceReplica = new GlobalWorkspaceDataSource(
        {
          url: this.cmsConfigService.get('PG_DATABASE_REPLICA_URL'),
          type: 'postgres',
          logging: this.cmsConfigService.getLoggingConfig(),
          entities: [],
          ssl: this.cmsConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
            ? {
                rejectUnauthorized: false,
              }
            : undefined,
          poolSize: this.cmsConfigService.get('PG_POOL_MAX_CONNECTIONS'),
          extra: {
            query_timeout: this.cmsConfigService.get(
              'PG_DATABASE_REPLICA_TIMEOUT_MS',
            ),
            idleTimeoutMillis: this.cmsConfigService.get(
              'PG_POOL_IDLE_TIMEOUT_MS',
            ),
            allowExitOnIdle: this.cmsConfigService.get(
              'PG_POOL_ALLOW_EXIT_ON_IDLE',
            ),
          },
        },
        this.workspaceEventEmitter,
      );
      await this.globalWorkspaceDataSourceReplica.initialize();
    }
  }

  public getGlobalWorkspaceDataSource(): GlobalWorkspaceDataSource {
    if (!isDefined(this.globalWorkspaceDataSource)) {
      throw new Error(
        'GlobalWorkspaceDataSource has not been initialized. Make sure the module has been initialized.',
      );
    }

    return this.globalWorkspaceDataSource;
  }

  public getGlobalWorkspaceDataSourceReplica(): GlobalWorkspaceDataSource {
    if (!isDefined(this.globalWorkspaceDataSourceReplica)) {
      return this.getGlobalWorkspaceDataSource();
    }

    return this.globalWorkspaceDataSourceReplica;
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.globalWorkspaceDataSource) {
      await this.globalWorkspaceDataSource.destroy();
      this.globalWorkspaceDataSource = null;
    }
    if (this.globalWorkspaceDataSourceReplica) {
      await this.globalWorkspaceDataSourceReplica.destroy();
      this.globalWorkspaceDataSourceReplica = null;
    }
  }
}
