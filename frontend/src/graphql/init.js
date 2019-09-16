import { execute, makePromise } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import tokenStore from '../stores/token-store';

let token = '';

let unsubscribeTokenStore = tokenStore.subscribe(state => {
  token = state;
});

const endpointHttp = process.env.ENDPOINT_HTTP;
const endpointWs = process.env.ENDPOINT_WS;

const httpLink = new HttpLink({
  uri: endpointHttp,
  credentials: 'include'
});

const wsLink = new WebSocketLink({
  uri: endpointWs,
  options: {
    reconnect: true
  }
});

wsLink.subscriptionClient.use([
  {
    async applyMiddleware(options, next) {
      options.authorization = token;
      next();
    }
  }
]);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  errorLink.concat(httpLink)
);

// execute returns an Observable so it can be subscribed to
const exec = operation => {
  return execute(link, operation);
};

// For single execution operations, a Promise can be used
const execPromise = operation => {
  return makePromise(execute(link, operation));
};

export { execPromise, exec };
