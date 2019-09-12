import gql from 'graphql-tag';

const LOGIN_MUTATION = gql`
  mutation LOGIN_MUTATION($password: String!) {
    login(password: $password)
  }
`;

const LOGOUT_MUTATION = gql`
  mutation LOGOUT_MUTATION {
    logout
  }
`;

export { LOGIN_MUTATION, LOGOUT_MUTATION };
