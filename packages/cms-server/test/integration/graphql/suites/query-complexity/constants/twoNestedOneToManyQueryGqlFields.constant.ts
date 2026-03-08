export const TWO_NESTED_ONE_TO_MANY_QUERY_GQL_FIELDS = `
  id
  pointOfContactForProjects {
    edges {
      node {
        company {
            people {
            edges {
                node {
                id
                pointOfContactForProjects {
                    edges {
                        node {
                            id
                        }
                    }
                }
                }
            }
        }
        }
      }
    }
  }
`;
