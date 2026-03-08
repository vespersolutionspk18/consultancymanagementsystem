import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/cms-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardProjectViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'project'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    // allProjects view fields
    allProjectsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'allProjects',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allProjectsAmount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'allProjects',
        viewFieldName: 'amount',
        fieldName: 'amount',
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.AVG,
      },
    }),
    allProjectsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'allProjects',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allProjectsSubmissionDate: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'allProjects',
        viewFieldName: 'submissionDate',
        fieldName: 'submissionDate',
        position: 3,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.MIN,
      },
    }),
    allProjectsCompanies: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'allProjects',
        viewFieldName: 'companies',
        fieldName: 'companies',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allProjectsPointOfContact: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'allProjects',
        viewFieldName: 'pointOfContact',
        fieldName: 'pointOfContact',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),

    // byStage view fields
    byStageName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    byStageAmount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewFieldName: 'amount',
        fieldName: 'amount',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    byStageCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    byStageSubmissionDate: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewFieldName: 'submissionDate',
        fieldName: 'submissionDate',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    byStageCompanies: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewFieldName: 'companies',
        fieldName: 'companies',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    byStagePointOfContact: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'project',
      context: {
        viewName: 'byStage',
        viewFieldName: 'pointOfContact',
        fieldName: 'pointOfContact',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
