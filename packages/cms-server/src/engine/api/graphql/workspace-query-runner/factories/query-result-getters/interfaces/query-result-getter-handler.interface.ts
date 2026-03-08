import { type ObjectRecord } from 'cms-shared/types';

export interface QueryResultGetterHandlerInterface {
  handle(
    objectRecord: ObjectRecord,
    workspaceId: string,
  ): Promise<ObjectRecord>;
}
