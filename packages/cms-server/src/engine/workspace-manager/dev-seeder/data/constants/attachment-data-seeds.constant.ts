type AttachmentDataSeed = {
  id: string;
  name: string;
  fullPath: string;
  fileCategory: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  personId: string | null;
  companyId: string | null;
  noteId: string | null;
  taskId: string | null;
  projectId: string | null;
};

export const ATTACHMENT_DATA_SEED_COLUMNS: (keyof AttachmentDataSeed)[] = [
  'id',
  'name',
  'fullPath',
  'fileCategory',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'personId',
  'companyId',
  'noteId',
  'taskId',
  'projectId',
];

export const ATTACHMENT_DATA_SEED_IDS = {} as Record<string, string>;

export const ATTACHMENT_DATA_SEEDS: AttachmentDataSeed[] = [];
