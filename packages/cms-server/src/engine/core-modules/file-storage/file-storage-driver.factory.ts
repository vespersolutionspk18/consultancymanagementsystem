import { Injectable } from '@nestjs/common';

import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import { StorageDriverType } from 'src/engine/core-modules/file-storage/interfaces/file-storage.interface';

import { LocalDriver } from 'src/engine/core-modules/file-storage/drivers/local.driver';
import { S3Driver } from 'src/engine/core-modules/file-storage/drivers/s3.driver';
import { DriverFactoryBase } from 'src/engine/core-modules/cms-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/cms-config/enums/config-variables-group.enum';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';
import { resolveAbsolutePath } from 'src/utils/resolve-absolute-path';

@Injectable()
export class FileStorageDriverFactory extends DriverFactoryBase<StorageDriver> {
  constructor(cmsConfigService: CMSConfigService) {
    super(cmsConfigService);
  }

  protected buildConfigKey(): string {
    const storageType = this.cmsConfigService.get('STORAGE_TYPE');

    if (storageType === StorageDriverType.LOCAL) {
      const storagePath = this.cmsConfigService.get('STORAGE_LOCAL_PATH');

      return `local|${storagePath}`;
    }

    if (storageType === StorageDriverType.S_3) {
      const storageConfigHash = this.getConfigGroupHash(
        ConfigVariablesGroup.STORAGE_CONFIG,
      );

      return `s3|${storageConfigHash}`;
    }

    throw new Error(`Unsupported storage type: ${storageType}`);
  }

  protected createDriver(): StorageDriver {
    const storageType = this.cmsConfigService.get('STORAGE_TYPE');

    switch (storageType) {
      case StorageDriverType.LOCAL: {
        const storagePath = this.cmsConfigService.get('STORAGE_LOCAL_PATH');

        return new LocalDriver({
          storagePath: resolveAbsolutePath(storagePath),
        });
      }

      case StorageDriverType.S_3: {
        const bucketName = this.cmsConfigService.get('STORAGE_S3_NAME');
        const endpoint = this.cmsConfigService.get('STORAGE_S3_ENDPOINT');
        const region = this.cmsConfigService.get('STORAGE_S3_REGION');
        const accessKeyId = this.cmsConfigService.get(
          'STORAGE_S3_ACCESS_KEY_ID',
        );
        const secretAccessKey = this.cmsConfigService.get(
          'STORAGE_S3_SECRET_ACCESS_KEY',
        );

        return new S3Driver({
          bucketName: bucketName ?? '',
          endpoint: endpoint,
          credentials: accessKeyId
            ? { accessKeyId, secretAccessKey }
            : fromNodeProviderChain({ clientConfig: { region } }),
          forcePathStyle: true,
          region: region ?? '',
        });
      }

      default:
        throw new Error(`Invalid storage driver type: ${storageType}`);
    }
  }
}
