export type Project = {
  __typename: 'Project';
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string | null;
};
