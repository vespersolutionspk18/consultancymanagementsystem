type NoteTargetDataSeed = {
  id: string;
  noteId: string | null;
  personId: string | null;
  companyId: string | null;
  projectId: string | null;
};

export const NOTE_TARGET_DATA_SEED_COLUMNS: (keyof NoteTargetDataSeed)[] = [
  'id',
  'noteId',
  'personId',
  'companyId',
  'projectId',
];

export const NOTE_TARGET_DATA_SEEDS: NoteTargetDataSeed[] = [];

export const NOTE_TARGET_DATA_SEEDS_MAP = new Map<
  string,
  NoteTargetDataSeed
>();
