import { Module } from '@nestjs/common';

import { CMSORMModule } from 'src/engine/cms-orm/cms-orm.module';

import { RecordPositionService } from './services/record-position.service';

@Module({
  imports: [CMSORMModule],
  providers: [RecordPositionService],
  exports: [RecordPositionService],
})
export class RecordPositionModule {}
