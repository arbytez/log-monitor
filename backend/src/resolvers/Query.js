const { AuthenticationError } = require('apollo-server-express');

const { hasPermission } = require('../utils');
const { logFilesConfig } = require('../configs');

const logFiles = logFilesConfig();
const watchedLogsOutput = Object.keys(logFiles).map(function(key) {
  return { name: key, path: logFiles[key] };
});

const Query = {
  async logged(parent, args, ctx, info) {
    return Boolean(ctx.logged);
  },
  async watchedLogs(parent, args, ctx, info) {
    if (!ctx.logged) throw new AuthenticationError('you must be logged in');
    return watchedLogsOutput;
  }
};

module.exports = Query;
