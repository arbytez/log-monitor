const { AuthenticationError } = require('apollo-server-express');

const { logFilesConfig } = require('../configs');

const Subscription = {};
const logFiles = logFilesConfig();
let SubscriptionTypeDefs = 'type Subscription { ';

Object.keys(logFiles).forEach(el => {
  SubscriptionTypeDefs += `${el}: LogEvent `;
  Subscription[el] = {
    subscribe: async (parent, args, ctx) => {
      if (!ctx.connCtx.logged)
        throw new AuthenticationError('you must be logged in');
      return ctx.pubsub.asyncIterator(el);
    }
  };
});

SubscriptionTypeDefs += '}';

exports.SubscriptionTypeDefs = SubscriptionTypeDefs;
exports.Subscription = Subscription;
