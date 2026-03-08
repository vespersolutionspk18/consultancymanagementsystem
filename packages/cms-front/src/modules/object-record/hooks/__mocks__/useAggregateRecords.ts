import { gql } from '@apollo/client';

export const AGGREGATE_QUERY = gql`
  query AggregateProjects($filter: ProjectFilterInput) {
    projects(filter: $filter) {
      totalCount
      sumAmount
      avgAmount
    }
  }
`;

export const mockResponse = {
  projects: {
    totalCount: 42,
    sumAmount: 1000000,
    avgAmount: 23800
  }
};