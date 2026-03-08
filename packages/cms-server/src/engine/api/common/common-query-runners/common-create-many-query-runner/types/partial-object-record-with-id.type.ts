import { type ObjectRecord } from 'cms-shared/types';

export type PartialObjectRecordWithId = Partial<ObjectRecord> & { id: string };
