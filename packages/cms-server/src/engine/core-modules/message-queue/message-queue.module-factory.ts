import {
  type BullMQDriverFactoryOptions,
  MessageQueueDriverType,
  type MessageQueueModuleOptions,
} from 'src/engine/core-modules/message-queue/interfaces';
import { type RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { type CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

/**
 * MessageQueue Module factory
 * @returns MessageQueueModuleOptions
 * @param cmsConfigService
 */
export const messageQueueModuleFactory = async (
  _cmsConfigService: CMSConfigService,
  redisClientService: RedisClientService,
): Promise<MessageQueueModuleOptions> => {
  const driverType = MessageQueueDriverType.BullMQ;

  switch (driverType) {
    case MessageQueueDriverType.BullMQ: {
      return {
        type: MessageQueueDriverType.BullMQ,
        options: {
          connection: redisClientService.getQueueClient(),
        },
      } satisfies BullMQDriverFactoryOptions;
    }
    default:
      throw new Error(
        `Invalid message queue driver type (${driverType}), check your .env file`,
      );
  }
};
