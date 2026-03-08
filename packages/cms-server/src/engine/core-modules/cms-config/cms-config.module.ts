import { type DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  ConfigVariables,
  validate,
} from 'src/engine/core-modules/cms-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/cms-config/constants/config-variables-instance-tokens.constants';
import { DatabaseConfigModule } from 'src/engine/core-modules/cms-config/drivers/database-config.module';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/cms-config/drivers/environment-config.driver';
import { ConfigurableModuleClass } from 'src/engine/core-modules/cms-config/cms-config.module-definition';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

@Global()
@Module({})
export class CMSConfigModule extends ConfigurableModuleClass {
  static forRoot(): DynamicModule {
    const isConfigVariablesInDbEnabled =
      process.env.IS_CONFIG_VARIABLES_IN_DB_ENABLED !== 'false';

    const imports = [
      ConfigModule.forRoot({
        isGlobal: true,
        expandVariables: true,
        validate,
        envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      }),
      ...(isConfigVariablesInDbEnabled ? [DatabaseConfigModule.forRoot()] : []),
    ];

    return {
      module: CMSConfigModule,
      imports,
      providers: [
        CMSConfigService,
        EnvironmentConfigDriver,
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: new ConfigVariables(),
        },
      ],
      exports: [CMSConfigService],
    };
  }
}
