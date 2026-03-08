type NoteDataSeed = {
  id: string;
  position: number;
  title: string;
  bodyV2Blocknote: string;
  bodyV2Markdown: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  createdByContext: string | null;
};

export const NOTE_DATA_SEED_COLUMNS: (keyof NoteDataSeed)[] = [
  'id',
  'position',
  'title',
  'bodyV2Blocknote',
  'bodyV2Markdown',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'createdByContext',
];

export const NOTE_DATA_SEED_IDS = {} as Record<string, string>;

export const NOTE_DATA_SEEDS: NoteDataSeed[] = [];
