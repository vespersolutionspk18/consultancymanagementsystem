import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'cms-shared/metadata';
import {
  type ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
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
import { EDUCATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.education,
  namePlural: 'educations',
  labelSingular: msg`Education`,
  labelPlural: msg`Educations`,
  description: msg`An education record`,
  icon: STANDARD_OBJECT_ICONS.education,
  labelIdentifierStandardId: EDUCATION_STANDARD_FIELD_IDS.degree,
})
export class EducationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: EDUCATION_STANDARD_FIELD_IDS.degree,
    type: FieldMetadataType.TEXT,
    label: msg`Degree`,
    description: msg`Name of the degree`,
    icon: 'IconSchool',
  })
  @WorkspaceIsNullable()
  degree: string | null;

  @WorkspaceField({
    standardId: EDUCATION_STANDARD_FIELD_IDS.majorMinor,
    type: FieldMetadataType.TEXT,
    label: msg`Major / Minor`,
    description: msg`Major or minor field of study`,
    icon: 'IconBook',
  })
  @WorkspaceIsNullable()
  majorMinor: string | null;

  @WorkspaceField({
    standardId: EDUCATION_STANDARD_FIELD_IDS.institution,
    type: FieldMetadataType.TEXT,
    label: msg`Institution`,
    description: msg`Name of the educational institution`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  institution: string | null;

  @WorkspaceField({
    standardId: EDUCATION_STANDARD_FIELD_IDS.country,
    type: FieldMetadataType.TEXT,
    label: msg`Country`,
    description: msg`Country where the institution is located`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  country: string | null;

  @WorkspaceField({
    standardId: EDUCATION_STANDARD_FIELD_IDS.yearOfCompletion,
    type: FieldMetadataType.TEXT,
    label: msg`Year / Date of Completion`,
    description: msg`Year or date of completion`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  yearOfCompletion: string | null;

  @WorkspaceField({
    standardId: EDUCATION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: EDUCATION_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: EDUCATION_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Person this education belongs to`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'educations',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;
}
