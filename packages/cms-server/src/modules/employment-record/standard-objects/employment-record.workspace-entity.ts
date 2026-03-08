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
import { EMPLOYMENT_RECORD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.employmentRecord,
  namePlural: 'employmentRecords',
  labelSingular: msg`Employment Record`,
  labelPlural: msg`Employment Records`,
  description: msg`An employment record`,
  icon: STANDARD_OBJECT_ICONS.employmentRecord,
  labelIdentifierStandardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.employerName,
})
export class EmploymentRecordWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.employerName,
    type: FieldMetadataType.TEXT,
    label: msg`Employer Name`,
    description: msg`Name of the employer`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  employerName: string | null;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.country,
    type: FieldMetadataType.TEXT,
    label: msg`Country`,
    description: msg`Country of employment`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  country: string | null;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.province,
    type: FieldMetadataType.TEXT,
    label: msg`Province`,
    description: msg`Province or state of employment`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  province: string | null;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.positionDesignation,
    type: FieldMetadataType.TEXT,
    label: msg`Position / Designation`,
    description: msg`Position or designation held`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  positionDesignation: string | null;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.fromDate,
    type: FieldMetadataType.DATE,
    label: msg`From (Date)`,
    description: msg`Employment start date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  fromDate: Date | null;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.toDate,
    type: FieldMetadataType.DATE,
    label: msg`To (Date)`,
    description: msg`Employment end date`,
    icon: 'IconCalendarCheck',
  })
  @WorkspaceIsNullable()
  toDate: Date | null;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.jobDescription,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Brief Job Description`,
    description: msg`Brief description of job responsibilities`,
    icon: 'IconFileDescription',
  })
  @WorkspaceIsNullable()
  jobDescription: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: EMPLOYMENT_RECORD_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Person this employment record belongs to`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'employmentRecords',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;
}
