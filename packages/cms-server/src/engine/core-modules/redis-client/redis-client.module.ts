import { Global, Module } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { CMSConfigModule } from 'src/engine/core-modules/cms-config/cms-config.module';

@Global()
@Module({
  imports: [CMSConfigModule],
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
