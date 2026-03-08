import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'cms-shared/metadata';
import {
  ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'cms-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/cms-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/cms-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/cms-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/cms-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/cms-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/cms-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/cms-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/cms-orm/decorators/workspace-relation.decorator';
import { PROJECT_CHAT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { ProjectWorkspaceEntity } from 'src/modules/project/standard-objects/project.workspace-entity';

// Type for chat messages stored as JSON
export interface ProjectChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Type for selected files stored as JSON
export interface ProjectChatSelectedFile {
  attachmentId: string;
  name: string;
  fullPath: string;
  mimeType?: string;
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.projectChat,

  namePlural: 'projectChats',
  labelSingular: msg`Chat`,
  labelPlural: msg`Chats`,
  description: msg`An AI chat conversation within a project`,
  icon: STANDARD_OBJECT_ICONS.projectChat,
  labelIdentifierStandardId: PROJECT_CHAT_STANDARD_FIELD_IDS.title,
})
@WorkspaceIsSystem()
export class ProjectChatWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PROJECT_CHAT_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Chat title`,
    icon: 'IconMessageChatbot',
  })
  @WorkspaceIsNullable()
  title: string | null;

  @WorkspaceField({
    standardId: PROJECT_CHAT_STANDARD_FIELD_IDS.messages,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Messages`,
    description: msg`Chat messages as JSON array`,
    icon: 'IconMessages',
  })
  @WorkspaceIsNullable()
  messages: ProjectChatMessage[] | null;

  @WorkspaceField({
    standardId: PROJECT_CHAT_STANDARD_FIELD_IDS.selectedFiles,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Selected Files`,
    description: msg`Selected file attachments for context (max 5)`,
    icon: 'IconFiles',
  })
  @WorkspaceIsNullable()
  selectedFiles: ProjectChatSelectedFile[] | null;

  @WorkspaceField({
    standardId: PROJECT_CHAT_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Chat record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: PROJECT_CHAT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: PROJECT_CHAT_STANDARD_FIELD_IDS.project,
    type: RelationType.MANY_TO_ONE,
    label: msg`Project`,
    description: msg`Project this chat belongs to`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => ProjectWorkspaceEntity,
    inverseSideFieldKey: 'chats',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  project: Relation<ProjectWorkspaceEntity> | null;

  @WorkspaceJoinColumn('project')
  projectId: string | null;
}
