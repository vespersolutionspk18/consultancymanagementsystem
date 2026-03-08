import {
  type ServerlessFunctionManifest,
  type ServerlessFunctionTriggerManifest,
} from 'cms-shared/application';

export type FunctionConfig = Omit<
  ServerlessFunctionManifest,
  'handlerPath' | 'handlerName'
> & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers?: ServerlessFunctionTriggerManifest[];
};
