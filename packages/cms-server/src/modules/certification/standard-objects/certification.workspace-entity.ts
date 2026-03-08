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
import { CERTIFICATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.certification,
  namePlural: 'certifications',
  labelSingular: msg`Certification`,
  labelPlural: msg`Certifications`,
  description: msg`A certification record`,
  icon: STANDARD_OBJECT_ICONS.certification,
  labelIdentifierStandardId: CERTIFICATION_STANDARD_FIELD_IDS.certificate,
})
export class CertificationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.certificate,
    type: FieldMetadataType.TEXT,
    label: msg`Certificate`,
    description: msg`Name of the certificate`,
    icon: 'IconCertificate',
  })
  @WorkspaceIsNullable()
  certificate: string | null;

  @WorkspaceField({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.majorMinor,
    type: FieldMetadataType.TEXT,
    label: msg`Major / Minor`,
    description: msg`Major or minor field of certification`,
    icon: 'IconBook',
  })
  @WorkspaceIsNullable()
  majorMinor: string | null;

  @WorkspaceField({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.institution,
    type: FieldMetadataType.TEXT,
    label: msg`Institution`,
    description: msg`Name of the certifying institution`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  institution: string | null;

  @WorkspaceField({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.country,
    type: FieldMetadataType.TEXT,
    label: msg`Country`,
    description: msg`Country where the certification was obtained`,
    icon: 'IconFlag',
  })
  @WorkspaceIsNullable()
  country: string | null;

  @WorkspaceField({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.yearOfCompletion,
    type: FieldMetadataType.TEXT,
    label: msg`Year / Date of Completion`,
    description: msg`Year or date of certification completion`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  yearOfCompletion: string | null;

  @WorkspaceField({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: CERTIFICATION_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Person this certification belongs to`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'certifications',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;
}
