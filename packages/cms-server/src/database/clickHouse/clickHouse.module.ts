import { Module } from '@nestjs/common';

import { CMSConfigModule } from 'src/engine/core-modules/cms-config/cms-config.module';

import { ClickHouseService } from './clickHouse.service';

@Module({
  imports: [CMSConfigModule],
  providers: [ClickHouseService],
  exports: [ClickHouseService],
})
export class ClickHouseModule {}
