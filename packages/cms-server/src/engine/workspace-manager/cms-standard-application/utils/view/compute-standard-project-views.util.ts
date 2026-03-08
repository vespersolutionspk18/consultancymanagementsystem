import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/cms-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardProjectViews = (
  args: Omit<CreateStandardViewArgs<'project'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allProjects: createStandardViewFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'allProjects',
        name: 'All Projects',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    byStage: createStandardViewFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        name: 'By Stage',
        type: ViewType.KANBAN,
        key: null,
        position: 2,
        icon: 'IconLayoutKanban',
        mainGroupByFieldName: 'stage',
        kanbanAggregateOperation: AggregateOperations.MIN,
        kanbanAggregateOperationFieldName: 'amount',
      },
    }),
  };
};
