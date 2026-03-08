import { Module } from '@nestjs/common';

import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { UpsertRecordService } from 'src/engine/core-modules/record-crud/services/upsert-record.service';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { RecordTransformerModule } from 'src/engine/core-modules/record-transformer/record-transformer.module';
import { CMSORMModule } from 'src/engine/cms-orm/cms-orm.module';
import { WorkflowCommonModule } from 'src/modules/workflow/common/workflow-common.module';

@Module({
  imports: [
    CMSORMModule,
    RecordPositionModule,
    RecordTransformerModule,
    WorkflowCommonModule,
  ],
  providers: [
    CreateRecordService,
    UpdateRecordService,
    DeleteRecordService,
    FindRecordsService,
    UpsertRecordService,
  ],
  exports: [
    CreateRecordService,
    UpdateRecordService,
    DeleteRecordService,
    FindRecordsService,
    UpsertRecordService,
  ],
})
export class RecordCrudModule {}
