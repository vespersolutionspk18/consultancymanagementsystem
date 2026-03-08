type PersonDataSeed = {
  id: string;
  nameFirstName: string;
  nameLastName: string;
  city: string;
  emailsPrimaryEmail: string;
  avatarUrl: string;
  linkedinLinkPrimaryLinkUrl: string;
  jobTitle: string;
  companyId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  phonesPrimaryPhoneNumber: string;
  phonesPrimaryPhoneCountryCode: string;
  phonesPrimaryPhoneCallingCode: string;
  position: number;
};

export const PERSON_DATA_SEED_COLUMNS: (keyof PersonDataSeed)[] = [
  'id',
  'nameFirstName',
  'nameLastName',
  'city',
  'emailsPrimaryEmail',
  'avatarUrl',
  'linkedinLinkPrimaryLinkUrl',
  'jobTitle',
  'companyId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'phonesPrimaryPhoneNumber',
  'phonesPrimaryPhoneCountryCode',
  'phonesPrimaryPhoneCallingCode',
  'position',
];

export const PERSON_DATA_SEED_IDS = {} as Record<string, string>;

export const PERSON_DATA_SEEDS: PersonDataSeed[] = [];

export const PERSON_DATA_SEEDS_MAP = new Map<string, PersonDataSeed>();
