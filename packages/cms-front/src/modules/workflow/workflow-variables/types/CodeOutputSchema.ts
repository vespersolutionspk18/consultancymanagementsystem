import { type LinkOutputSchema } from '@/workflow/workflow-variables/types/LinkOutputSchema';
import { type BaseOutputSchemaV2 } from 'cms-shared/workflow';

export type CodeOutputSchema = LinkOutputSchema | BaseOutputSchemaV2;
