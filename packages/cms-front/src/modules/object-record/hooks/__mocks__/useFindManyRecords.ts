import { gql } from '@apollo/client';

export const query = gql`
  query FindManyPeople(
    $filter: PersonFilterInput
    $orderBy: PersonOrderByInput
    $lastCursor: String
    $limit: Int
  ) {
    people(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          id
          projects {
            edges {
              node {
                __typename
                id
                personId
                pointOfContactId
                updatedAt
                companyId
                stage
                submissionDate
                amount {
                  amountMicros
                  currencyCode
                }
                id
                createdAt
              }
            }
          }
          xLink {
            primaryLinkLabel
            primaryLinkUrl
          }
          id
          pointOfContactForProjects {
            edges {
              node {
                __typename
                id
                personId
                pointOfContactId
                updatedAt
                companyId
                stage
                submissionDate
                amount {
                  amountMicros
                  currencyCode
                }
                id
                createdAt
              }
            }
          }
          createdAt
          company {
            __typename
            id
            xLink {
              primaryLinkLabel
              primaryLinkUrl
            }
            linkedinLink {
              primaryLinkLabel
              primaryLinkUrl
            }
            domainName
            annualRecurringRevenue {
              amountMicros
              currencyCode
            }
            createdAt
            address {
              addressStreet1
              addressStreet2
              addressCity
              addressState
              addressCountry
              addressPostcode
              addressLat
              addressLng
            }
            updatedAt
            name
            accountOwnerId
            employees
            id
            idealCustomerProfile
          }
          city
          email
          jobTitle
          favorites {
            edges {
              node {
                __typename
                id
                companyId
                createdAt
                forWorkspaceMemberId
                personId
                position
                updatedAt
              }
            }
          }
          attachments {
            edges {
              node {
                __typename
                id
                updatedAt
                createdAt
                name
                personId
                companyId
                id
                fullPath
              }
            }
          }
          name {
            firstName
            lastName
          }
          phone
          linkedinLink {
            primaryLinkLabel
            primaryLinkUrl
          }
          updatedAt
          avatarUrl
          companyId
        }
        cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

export const variables = { limit: 60, filter: undefined, orderBy: undefined };

export const responseData = {
  id: '',
};
