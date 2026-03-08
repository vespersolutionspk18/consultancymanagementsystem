import { MessageParticipantRole } from 'cms-shared/types';

export type MessageParticipantDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  workspaceMemberId: string;
  personId: string;
  displayName: string;
  handle: string;
  role: MessageParticipantRole;
  messageId: string;
};

export const MESSAGE_PARTICIPANT_DATA_SEED_COLUMNS: (keyof MessageParticipantDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'workspaceMemberId',
    'personId',
    'displayName',
    'handle',
    'role',
    'messageId',
  ];

export const MESSAGE_PARTICIPANT_DATA_SEED_IDS = {} as Record<string, string>;

export const getMessageParticipantDataSeeds = (
  _workspaceId: string,
): MessageParticipantDataSeed[] => {
  return [];
};
