const jwt = require('jsonwebtoken');
const {
  ApolloServer,
  makeExecutableSchema,
  AuthenticationError
} = require('apollo-server-express');
const { importSchema } = require('graphql-import');

const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const {
  Subscription,
  SubscriptionTypeDefs
} = require('./resolvers/Subscription');
const pubsub = require('./pubsub');

const schema = makeExecutableSchema({
  typeDefs: importSchema('src/schema.graphql').concat(SubscriptionTypeDefs),
  resolvers: {
    Mutation,
    Query,
    Subscription
  },
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

function createServer() {
  return new ApolloServer({
    schema,
    context: async ({ req, connection, payload }) => {
      if (connection) {
        const connCtx = connection.context;
        try {
          if (payload && payload.authorization) {
            const logged = jwt.verify(
              payload.authorization,
              process.env.JWT_SECRET
            );
            if (logged) {
              connCtx.logged = { ...logged };
            }
          }
        } catch (error) {}
        return { ...req, pubsub, connCtx };
      }
      return { ...req, pubsub };
    },
    subscriptions: {
      onConnect: async (connectionParams, webSocket) => {
        try {
          if (connectionParams && connectionParams.authorization) {
            const logged = jwt.verify(
              connectionParams.authorization,
              process.env.JWT_SECRET
            );
            if (logged) {
              return { ...logged };
            }
          }
        } catch (error) {}
      }
    },
    engine: {
      rewriteError(err) {
        // Return `null` to avoid reporting `AuthenticationError`s
        if (err instanceof AuthenticationError) {
          return null;
        }
        // All other errors will be reported.
        return err;
      }
    }
  });
}

module.exports = createServer;
