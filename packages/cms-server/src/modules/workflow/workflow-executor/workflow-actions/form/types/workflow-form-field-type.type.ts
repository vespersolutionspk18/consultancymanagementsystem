import { type FieldMetadataType } from 'cms-shared/types';

export type WorkflowFormFieldType =
  | FieldMetadataType.TEXT
  | FieldMetadataType.NUMBER
  | FieldMetadataType.DATE
  | 'RECORD';
