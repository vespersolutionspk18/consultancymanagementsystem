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
import { WorkspaceIsSearchable } from 'src/engine/cms-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/cms-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/cms-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/cms-orm/decorators/workspace-relation.decorator';
import { SECTOR_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { ProjectWorkspaceEntity } from 'src/modules/project/standard-objects/project.workspace-entity';

export const SEARCH_FIELDS_FOR_SECTOR: FieldTypeAndNameMetadata[] = [
  { name: 'name', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.sector,
  namePlural: 'sectors',
  labelSingular: msg`Sector`,
  labelPlural: msg`Sectors`,
  description: msg`A sector`,
  icon: STANDARD_OBJECT_ICONS.sector,
  labelIdentifierStandardId: SECTOR_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class SectorWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: SECTOR_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The sector name`,
    icon: 'IconCategory',
  })
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: SECTOR_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Sector record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: SECTOR_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: SECTOR_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Sector company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'sectors',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: SECTOR_STANDARD_FIELD_IDS.project,
    type: RelationType.MANY_TO_ONE,
    label: msg`Project`,
    description: msg`Sector project`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => ProjectWorkspaceEntity,
    inverseSideFieldKey: 'sectors',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  project: Relation<ProjectWorkspaceEntity> | null;

  @WorkspaceJoinColumn('project')
  projectId: string | null;
}
