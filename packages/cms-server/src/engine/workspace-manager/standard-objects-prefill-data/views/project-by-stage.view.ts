import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'cms-shared/metadata';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/cms-standard-application/constants/standard-object.constant';
import { PROJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const projectsByStageView = ({
  objectMetadataItems,
  useCoreNaming = false,
  cmsStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  cmsStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const projectObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.project,
  );

  if (!projectObjectMetadata) {
    throw new Error('Project object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.project.views.byStage.universalIdentifier;

  const stageFieldMetadataId =
    projectObjectMetadata.fields.find(
      (field) => field.standardId === PROJECT_STANDARD_FIELD_IDS.stage,
    )?.id ?? '';

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: cmsStandardFlatApplication.id,
    name: useCoreNaming ? msg`By Stage` : 'By Stage',
    objectMetadataId: projectObjectMetadata.id,
    type: 'kanban',
    key: null,
    position: 2,
    icon: 'IconLayoutKanban',
    kanbanAggregateOperation: AggregateOperations.MIN,
    kanbanAggregateOperationFieldMetadataId:
      projectObjectMetadata.fields.find(
        (field) => field.standardId === PROJECT_STANDARD_FIELD_IDS.amount,
      )?.id ?? '',
    filters: [],
    mainGroupByFieldMetadataId: stageFieldMetadataId,
    fields: [
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) => field.standardId === PROJECT_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewFields.name
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewFields.amount
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewFields.createdBy
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.submissionDate,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewFields.submissionDate
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.companies,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewFields.companies
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              PROJECT_STANDARD_FIELD_IDS.pointOfContact,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewFields.pointOfContact
            .universalIdentifier,
      },
    ],
    groups: [
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'NEW',
        position: 0,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewGroups!.new
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'SCREENING',
        position: 1,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewGroups!.screening
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'MEETING',
        position: 2,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewGroups!.meeting
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'PROPOSAL',
        position: 3,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewGroups!.proposal
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          projectObjectMetadata.fields.find(
            (field) =>
              field.standardId === PROJECT_STANDARD_FIELD_IDS.stage,
          )?.id ?? '',
        isVisible: true,
        fieldValue: 'CUSTOMER',
        position: 4,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.byStage.viewGroups!.customer
            .universalIdentifier,
      },
    ],
  };
};
