import { type AvatarType } from 'cms-ui/display';
export type ObjectRecordIdentifier = {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType | null;
  linkToShowPage?: string;
};
