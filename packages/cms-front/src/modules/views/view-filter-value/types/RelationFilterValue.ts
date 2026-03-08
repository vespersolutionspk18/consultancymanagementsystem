import { type jsonRelationFilterValueSchema } from 'cms-shared/utils';
import { type z } from 'zod';

export type RelationFilterValue = z.infer<typeof jsonRelationFilterValueSchema>;
