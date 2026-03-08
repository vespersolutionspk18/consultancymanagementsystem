import { PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      ${PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS}
    }
  }
`;

export const responseData = {
  projects: {
    edges: [],
  },
  xLink: {
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: [],
  },
  pointOfContactForProjects: {
    edges: [],
  },
  createdAt: '',
  company: {
    id: '',
  },
  city: '',
  email: '',
  activityTargets: {
    edges: [],
  },
  jobTitle: '',
  favorites: {
    edges: [],
  },
  attachments: {
    edges: [],
  },
  name: {
    firstName: '',
    lastName: '',
  },
  phones: {
    primaryPhoneCountryCode: '',
    primaryPhoneCallingCode: '',
    primaryPhoneNumber: '',
  },
  linkedinLink: {
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: [],
  },
  updatedAt: '',
  avatarUrl: '',
  companyId: '',
};
