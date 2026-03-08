import { type CardType } from '@/object-record/record-show/types/CardType';

// Card configuration types - each card type can define its own configuration
export type FieldCardConfiguration = {
  showDuplicatesSection?: boolean;
  excludeFieldNames?: string[];
  excludeRelationFieldNames?: string[];
  includeRelationFieldNames?: string[];
  relationFieldLabelOverrides?: Record<string, string>;
};

// Configuration for RelationTableCard - displays related records in a table
export type RelationTableCardConfiguration = {
  relationFieldName: string;
  title?: string;
};

// For cards that don't need configuration, use undefined
export type EmptyCardConfiguration = undefined;

// Type mapping from CardType to its specific configuration type
// This creates precise typing: each CardType is linked to exactly one configuration type
export type CardTypeToConfiguration = {
  [CardType.FieldCard]: FieldCardConfiguration;
  [CardType.TimelineCard]: EmptyCardConfiguration;
  [CardType.TaskCard]: EmptyCardConfiguration;
  [CardType.NoteCard]: EmptyCardConfiguration;
  [CardType.FileCard]: EmptyCardConfiguration;
  [CardType.EmailCard]: EmptyCardConfiguration;
  [CardType.CalendarCard]: EmptyCardConfiguration;
  [CardType.FieldRichTextCard]: EmptyCardConfiguration;
  [CardType.WorkflowCard]: EmptyCardConfiguration;
  [CardType.WorkflowVersionCard]: EmptyCardConfiguration;
  [CardType.WorkflowRunCard]: EmptyCardConfiguration;
  [CardType.DashboardCard]: EmptyCardConfiguration;
  [CardType.RelationTableCard]: RelationTableCardConfiguration;
  [CardType.ProjectChatCard]: EmptyCardConfiguration;
};

// Union type for all card configurations (for general use)
export type CardConfiguration =
  | FieldCardConfiguration
  | RelationTableCardConfiguration
  | EmptyCardConfiguration;
