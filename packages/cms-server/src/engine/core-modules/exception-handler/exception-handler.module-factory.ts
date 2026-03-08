import { type HttpAdapterHost } from '@nestjs/core';

import { NodeEnvironment } from 'src/engine/core-modules/cms-config/interfaces/node-environment.interface';

import { type OPTIONS_TYPE } from 'src/engine/core-modules/exception-handler/exception-handler.module-definition';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { type CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

/**
 * ExceptionHandler Module factory
 * @returns ExceptionHandlerModuleOptions
 * @param cmsConfigService
 * @param adapterHost
 */
export const exceptionHandlerModuleFactory = async (
  cmsConfigService: CMSConfigService,
  adapterHost: HttpAdapterHost,
): Promise<typeof OPTIONS_TYPE> => {
  const driverType = cmsConfigService.get('EXCEPTION_HANDLER_DRIVER');

  switch (driverType) {
    case ExceptionHandlerDriver.CONSOLE: {
      return {
        type: ExceptionHandlerDriver.CONSOLE,
      };
    }
    case ExceptionHandlerDriver.SENTRY: {
      return {
        type: ExceptionHandlerDriver.SENTRY,
        options: {
          environment: cmsConfigService.get('SENTRY_ENVIRONMENT'),
          release: cmsConfigService.get('APP_VERSION'),
          dsn: cmsConfigService.get('SENTRY_DSN') ?? '',
          serverInstance: adapterHost.httpAdapter?.getInstance(),
          debug:
            cmsConfigService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT,
        },
      };
    }
    default:
      throw new Error(
        `Invalid exception capturer driver type (${driverType}), check your .env file`,
      );
  }
};
