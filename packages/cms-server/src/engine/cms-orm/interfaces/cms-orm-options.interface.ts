import { type FactoryProvider, type ModuleMetadata } from '@nestjs/common';

export interface CMSORMOptions {
  [key: string]: unknown;
}

export type CMSORMModuleAsyncOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => CMSORMOptions | Promise<CMSORMOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
