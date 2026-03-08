import { gql } from '@apollo/client';

import { timelineThreadWithTotalFragment } from '@/activities/emails/graphql/queries/fragments/timelineThreadWithTotalFragment';

export const getTimelineThreadsFromProjectId = gql`
  query GetTimelineThreadsFromProjectId(
    $projectId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromProjectId(
      projectId: $projectId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineThreadsWithTotalFragment
    }
  }
  ${timelineThreadWithTotalFragment}
`;
