import { type DynamicModule, Global } from '@nestjs/common';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { CMSConfigModule } from 'src/engine/core-modules/cms-config/cms-config.module';

@Global()
export class FileStorageModule {
  static forRoot(): DynamicModule {
    return {
      module: FileStorageModule,
      imports: [CMSConfigModule],
      providers: [FileStorageDriverFactory, FileStorageService],
      exports: [FileStorageService],
    };
  }
}
