import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import {
  createStandardViewGroupFlatMetadata,
  type CreateStandardViewGroupArgs,
} from 'src/engine/workspace-manager/cms-standard-application/utils/view-group/create-standard-view-group-flat-metadata.util';

export const computeStandardProjectViewGroups = (
  args: Omit<CreateStandardViewGroupArgs<'project'>, 'context'>,
): Record<string, FlatViewGroup> => {
  return {
    byStageNew: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewGroupName: 'new',
        isVisible: true,
        fieldValue: 'NEW',
        position: 0,
      },
    }),
    byStageScreening: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewGroupName: 'screening',
        isVisible: true,
        fieldValue: 'SCREENING',
        position: 1,
      },
    }),
    byStageMeeting: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewGroupName: 'meeting',
        isVisible: true,
        fieldValue: 'MEETING',
        position: 2,
      },
    }),
    byStageProposal: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewGroupName: 'proposal',
        isVisible: true,
        fieldValue: 'PROPOSAL',
        position: 3,
      },
    }),
    byStageCustomer: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewGroupName: 'customer',
        isVisible: true,
        fieldValue: 'CUSTOMER',
        position: 4,
      },
    }),
  };
};
