import { type WorkflowRunStepInfo } from 'cms-shared/workflow';

export const getWorkflowRunStepInfoToDisplayAsOutput = ({
  stepInfo,
}: {
  stepInfo: WorkflowRunStepInfo;
}) => {
  const { status: _status, history: _history, ...infoToDisplay } = stepInfo;

  return infoToDisplay;
};
