import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'cms-shared/metadata';
import {
  ActorMetadata,
  type CurrencyMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
  type RichTextV2Metadata,
} from 'cms-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { BaseWorkspaceEntity } from 'src/engine/cms-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/cms-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/cms-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/cms-orm/decorators/workspace-field.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/cms-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/cms-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/cms-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/cms-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/cms-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/cms-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/cms-orm/decorators/workspace-relation.decorator';
import { PROJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ProjectChatWorkspaceEntity } from 'src/modules/project-chat/standard-objects/project-chat.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_PROJECT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.project,

  namePlural: 'projects',
  labelSingular: msg`Project`,
  labelPlural: msg`Projects`,
  description: msg`A project`,
  icon: STANDARD_OBJECT_ICONS.project,
  shortcut: 'O',
  labelIdentifierStandardId: PROJECT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class ProjectWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The project name`,
    icon: 'IconTargetArrow',
  })
  @WorkspaceIsNullable()
  name: string;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.amount,
    type: FieldMetadataType.CURRENCY,
    label: msg`Amount`,
    description: msg`Project amount`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  amount: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.submissionDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Submission date`,
    description: msg`Project submission date`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  submissionDate: Date | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.preSubmissionDeadline,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Pre-Submission deadline`,
    description: msg`Project pre-submission deadline`,
    icon: 'IconCalendarDue',
  })
  @WorkspaceIsNullable()
  preSubmissionDeadline: Date | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.stage,
    type: FieldMetadataType.SELECT,
    label: msg`Stage`,
    description: msg`Project stage`,
    icon: 'IconProgressCheck',
    options: [
      { value: 'NEW', label: 'New', position: 0, color: 'red' },
      { value: 'SCREENING', label: 'Screening', position: 1, color: 'purple' },
      { value: 'MEETING', label: 'Meeting', position: 2, color: 'sky' },
      {
        value: 'PROPOSAL',
        label: 'Proposal',
        position: 3,
        color: 'turquoise',
      },
      { value: 'CUSTOMER', label: 'Customer', position: 4, color: 'yellow' },
    ],
    defaultValue: "'NEW'",
  })
  @WorkspaceFieldIndex()
  stage: string;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.client,
    type: FieldMetadataType.TEXT,
    label: msg`Client`,
    description: msg`Client name`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  client: string | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.clientContactNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Client Contact Number`,
    description: msg`Client contact phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  clientContactNumber: string | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.clientEmail,
    type: FieldMetadataType.TEXT,
    label: msg`Client Email`,
    description: msg`Client email address`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  clientEmail: string | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.clientAddress,
    type: FieldMetadataType.TEXT,
    label: msg`Client Address`,
    description: msg`Client address`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  clientAddress: string | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.fundedBy,
    type: FieldMetadataType.TEXT,
    label: msg`Funded By`,
    description: msg`Project funding source`,
    icon: 'IconCash',
  })
  @WorkspaceIsNullable()
  fundedBy: string | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.bidSecurity,
    type: FieldMetadataType.CURRENCY,
    label: msg`Bid Security`,
    description: msg`Bid security amount`,
    icon: 'IconShieldCheck',
  })
  @WorkspaceIsNullable()
  bidSecurity: CurrencyMetadata | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.projectDuration,
    type: FieldMetadataType.TEXT,
    label: msg`Project Duration`,
    description: msg`Project duration`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  projectDuration: string | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Project record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.pointOfContact,
    type: RelationType.MANY_TO_ONE,
    label: msg`Point of Contact`,
    description: msg`Project point of contact`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'pointOfContactForProjects',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  pointOfContact: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('pointOfContact')
  pointOfContactId: string | null;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.sectors,
    type: RelationType.ONE_TO_MANY,
    label: msg`Sectors`,
    description: msg`Sectors linked to the project`,
    icon: 'IconCategory',
    inverseSideTarget: () => SectorWorkspaceEntity,
    inverseSideFieldKey: 'project',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  sectors: Relation<SectorWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.documentsAvailableAndApplication,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Documents Available & Application`,
    description: msg`Available documents and application details`,
    icon: 'IconFileDescription',
  })
  @WorkspaceIsNullable()
  documentsAvailableAndApplication: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.procurementDetails,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Procurement Details`,
    description: msg`Project procurement details`,
    icon: 'IconClipboardList',
  })
  @WorkspaceIsNullable()
  procurementDetails: RichTextV2Metadata | null;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.companies,
    type: RelationType.ONE_TO_MANY,
    label: msg`Companies`,
    description: msg`Companies linked to the project`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'project',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  companies: Relation<CompanyWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the project`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.taskTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Tasks`,
    description: msg`Tasks tied to the project`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.noteTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Notes`,
    description: msg`Notes tied to the project`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the project`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the project.`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'targetProject',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PROJECT_STANDARD_FIELD_IDS.chats,
    type: RelationType.ONE_TO_MANY,
    label: msg`Chats`,
    description: msg`AI chat conversations linked to the project`,
    icon: 'IconMessageChatbot',
    inverseSideTarget: () => ProjectChatWorkspaceEntity,
    inverseSideFieldKey: 'project',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  chats: Relation<ProjectChatWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.probabilityDeprecated,
    type: FieldMetadataType.TEXT,
    label: msg`Probability`,
    description: msg`Project probability`,
    icon: 'IconProgressCheck',
    defaultValue: "'0'",
  })
  @WorkspaceIsDeprecated()
  probability: string;

  @WorkspaceField({
    standardId: PROJECT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PROJECT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
