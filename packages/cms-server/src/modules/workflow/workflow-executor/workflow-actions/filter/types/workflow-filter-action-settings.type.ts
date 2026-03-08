import { type StepFilter, type StepFilterGroup } from 'cms-shared/types';

import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowFilterActionSettings = BaseWorkflowActionSettings & {
  input: {
    stepFilterGroups?: StepFilterGroup[];
    stepFilters?: StepFilter[];
  };
};
