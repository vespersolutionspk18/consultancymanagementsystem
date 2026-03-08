import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'cms-shared/metadata';
import {
  type ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
  type RichTextV2Metadata,
} from 'cms-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import type { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/cms-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/cms-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/cms-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/cms-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/cms-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/cms-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/cms-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/cms-orm/decorators/workspace-relation.decorator';
import { PAST_EXPERIENCE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.pastExperience,
  namePlural: 'pastExperiences',
  labelSingular: msg`Past Experience`,
  labelPlural: msg`Past Experiences`,
  description: msg`A past experience/assignment record`,
  icon: STANDARD_OBJECT_ICONS.pastExperience,
  labelIdentifierStandardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.assignmentTitle,
})
export class PastExperienceWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.projectIdentification,
    type: FieldMetadataType.TEXT,
    label: msg`Project Identification`,
    description: msg`Project identification code or number`,
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  projectIdentification: string | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.clientName,
    type: FieldMetadataType.TEXT,
    label: msg`Name of Client`,
    description: msg`Name of the client`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  clientName: string | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.assignmentTitle,
    type: FieldMetadataType.TEXT,
    label: msg`Assignment / Project Title`,
    description: msg`Title of the assignment or project`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  assignmentTitle: string | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.sectorType,
    type: FieldMetadataType.TEXT,
    label: msg`Sector / Type of Project`,
    description: msg`Sector or type of the project`,
    icon: 'IconCategory',
  })
  @WorkspaceIsNullable()
  sectorType: string | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.scopeDeliverables,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Scope & Deliverables`,
    description: msg`Scope and deliverables of the assignment`,
    icon: 'IconListCheck',
  })
  @WorkspaceIsNullable()
  scopeDeliverables: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.briefDescription,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Brief Description of Assignment`,
    description: msg`Brief description of the assignment`,
    icon: 'IconFileDescription',
  })
  @WorkspaceIsNullable()
  briefDescription: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.keyResponsibilities,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Key Responsibilities / Outputs`,
    description: msg`Key responsibilities and outputs`,
    icon: 'IconTarget',
  })
  @WorkspaceIsNullable()
  keyResponsibilities: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.roleInAssignment,
    type: FieldMetadataType.TEXT,
    label: msg`Role in the Assignment`,
    description: msg`Role in the assignment`,
    icon: 'IconUserCheck',
  })
  @WorkspaceIsNullable()
  roleInAssignment: string | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.startDate,
    type: FieldMetadataType.DATE,
    label: msg`Start Date`,
    description: msg`Start date of the assignment`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  startDate: Date | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.endDate,
    type: FieldMetadataType.DATE,
    label: msg`End Date`,
    description: msg`End date of the assignment`,
    icon: 'IconCalendarCheck',
  })
  @WorkspaceIsNullable()
  endDate: Date | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.durationMonths,
    type: FieldMetadataType.NUMBER,
    label: msg`Duration (Months)`,
    description: msg`Duration in months`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  durationMonths: number | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.projectValue,
    type: FieldMetadataType.CURRENCY,
    label: msg`Contract / Project Value`,
    description: msg`Contract or project value`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  projectValue: number | null;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: PAST_EXPERIENCE_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Person this experience belongs to`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'pastExperiences',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;
}
