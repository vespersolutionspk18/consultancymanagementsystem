type CompanyDataSeed = {
  id: string;
  name: string;
  domainNamePrimaryLinkUrl: string;
  addressAddressCity: string;
  employees: number;
  linkedinLinkPrimaryLinkUrl: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  accountOwnerId: string;
  position: number;
  projectId: string | null;
};

export const COMPANY_DATA_SEED_COLUMNS: (keyof CompanyDataSeed)[] = [
  'id',
  'name',
  'domainNamePrimaryLinkUrl',
  'addressAddressCity',
  'employees',
  'linkedinLinkPrimaryLinkUrl',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'accountOwnerId',
  'position',
  'projectId',
];

export const COMPANY_DATA_SEED_IDS = {} as Record<string, string>;

export const COMPANY_DATA_SEEDS: CompanyDataSeed[] = [];
