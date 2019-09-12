import gql from 'graphql-tag';

const LOGGED_QUERY = gql`
  query LOGGED_QUERY {
    logged
  }
`;

const WATCHEDLOGS_QUERY = gql`
  query WATCHEDLOGS_QUERY {
    watchedLogs {
      name
      path
    }
  }
`;

export { LOGGED_QUERY, WATCHEDLOGS_QUERY };
