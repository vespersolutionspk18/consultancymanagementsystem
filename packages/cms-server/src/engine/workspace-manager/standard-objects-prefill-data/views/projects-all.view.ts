import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'cms-shared/metadata';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/cms-standard-application/constants/standard-object.constant';
import { PROJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const projectsAllView = ({
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
    STANDARD_OBJECTS.project.views.allProjects.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: cmsStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Projects',
    objectMetadataId: projectObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    filters: [],
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
          STANDARD_OBJECTS.project.views.allProjects.viewFields.name
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
        aggregateOperation: AggregateOperations.AVG,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.allProjects.viewFields.amount
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
          STANDARD_OBJECTS.project.views.allProjects.viewFields
            .createdBy.universalIdentifier,
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
        aggregateOperation: AggregateOperations.MIN,
        universalIdentifier:
          STANDARD_OBJECTS.project.views.allProjects.viewFields
            .submissionDate.universalIdentifier,
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
          STANDARD_OBJECTS.project.views.allProjects.viewFields.companies
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
          STANDARD_OBJECTS.project.views.allProjects.viewFields
            .pointOfContact.universalIdentifier,
      },
    ],
  };
};
