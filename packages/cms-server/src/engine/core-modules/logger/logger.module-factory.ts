import {
  LoggerDriverType,
  type LoggerModuleOptions,
} from 'src/engine/core-modules/logger/interfaces';
import { type CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

/**
 * Logger Module factory
 * @returns LoggerModuleOptions
 * @param cmsConfigService
 */
export const loggerModuleFactory = async (
  cmsConfigService: CMSConfigService,
): Promise<LoggerModuleOptions> => {
  const driverType = cmsConfigService.get('LOGGER_DRIVER');
  const logLevels = cmsConfigService.get('LOG_LEVELS');

  switch (driverType) {
    case LoggerDriverType.CONSOLE: {
      return {
        type: LoggerDriverType.CONSOLE,
        logLevels: logLevels,
      };
    }
    default:
      throw new Error(
        `Invalid logger driver type (${driverType}), check your .env file`,
      );
  }
};
