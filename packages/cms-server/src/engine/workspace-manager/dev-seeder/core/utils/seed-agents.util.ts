import { type QueryRunner } from 'typeorm';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { SEED_RMS_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const agentChatThreadTableName = 'agentChatThread';
const agentTurnTableName = 'agentTurn';
const agentMessageTableName = 'agentMessage';
const agentMessagePartTableName = 'agentMessagePart';

export const AGENT_DATA_SEED_IDS = {
  RMS_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000001',
};

export const AGENT_CHAT_THREAD_DATA_SEED_IDS = {
  RMS_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000011',
};

export const AGENT_CHAT_MESSAGE_DATA_SEED_IDS = {
  RMS_MESSAGE_1: '20202020-0000-4000-8000-000000000021',
  RMS_MESSAGE_2: '20202020-0000-4000-8000-000000000022',
};

export const AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS = {
  RMS_MESSAGE_1_PART_1: '20202020-0000-4000-8000-000000000041',
  RMS_MESSAGE_2_PART_1: '20202020-0000-4000-8000-000000000042',
};

type SeedChatThreadsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

const seedChatThreads = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedChatThreadsArgs) => {
  let threadId: string;
  let userWorkspaceId: string;

  if (workspaceId === SEED_RMS_WORKSPACE_ID) {
    threadId = AGENT_CHAT_THREAD_DATA_SEED_IDS.RMS_DEFAULT_THREAD;
    userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.HASEEB;
  } else {
    throw new Error(
      `Unsupported workspace ID for agent chat thread seeding: ${workspaceId}`,
    );
  }

  const now = new Date();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatThreadTableName}`, [
      'id',
      'userWorkspaceId',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: threadId,
        userWorkspaceId,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .execute();

  return threadId;
};

type SeedChatMessagesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  threadId: string;
};

const seedChatMessages = async ({
  queryRunner,
  schemaName,
  workspaceId,
  threadId,
}: SeedChatMessagesArgs) => {
  const now = new Date();
  const baseTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (workspaceId !== SEED_RMS_WORKSPACE_ID) {
    throw new Error(
      `Unsupported workspace ID for agent chat message seeding: ${workspaceId}`,
    );
  }

  const messageIds = [
    AGENT_CHAT_MESSAGE_DATA_SEED_IDS.RMS_MESSAGE_1,
    AGENT_CHAT_MESSAGE_DATA_SEED_IDS.RMS_MESSAGE_2,
  ];
  const partIds = [
    AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.RMS_MESSAGE_1_PART_1,
    AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.RMS_MESSAGE_2_PART_1,
  ];
  const turnIds = ['20202020-0000-4000-8000-000000000061'];

  const messages = [
    {
      id: messageIds[0],
      threadId,
      turnId: turnIds[0],
      role: AgentMessageRole.USER,
      createdAt: new Date(baseTime.getTime()),
    },
    {
      id: messageIds[1],
      threadId,
      turnId: turnIds[0],
      role: AgentMessageRole.ASSISTANT,
      createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
    },
  ];

  const messageParts = [
    {
      id: partIds[0],
      messageId: messageIds[0],
      orderIndex: 0,
      type: 'text',
      textContent: 'Hello! How can I get started with RMS?',
      createdAt: new Date(baseTime.getTime()),
    },
    {
      id: partIds[1],
      messageId: messageIds[1],
      orderIndex: 0,
      type: 'text',
      textContent:
        'Welcome to RMS! You can start by adding your contacts, companies, and projects. Let me know if you need help with anything specific.',
      createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
    },
  ];

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentTurnTableName}`, [
      'id',
      'threadId',
      'createdAt',
    ])
    .orIgnore()
    .values(
      turnIds.map((id, index) => ({
        id,
        threadId,
        createdAt: messages[index * 2].createdAt,
      })),
    )
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentMessageTableName}`, [
      'id',
      'threadId',
      'turnId',
      'role',
      'createdAt',
    ])
    .orIgnore()
    .values(messages)
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentMessagePartTableName}`, [
      'id',
      'messageId',
      'orderIndex',
      'type',
      'textContent',
      'createdAt',
    ])
    .orIgnore()
    .values(messageParts)
    .execute();
};

type SeedAgentsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedAgents = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedAgentsArgs) => {
  const threadId = await seedChatThreads({
    queryRunner,
    schemaName,
    workspaceId,
  });

  await seedChatMessages({
    queryRunner,
    schemaName,
    workspaceId,
    threadId,
  });
};
