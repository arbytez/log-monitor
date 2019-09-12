const Tail = require('tail').Tail; // https://github.com/lucagrulla/node-tail

const signale = require('../logger');
const pubsub = require('../pubsub');
const { logFilesConfig } = require('../configs');

let logFilesTailObjects = [];

const createNewLogMonitor = (logName, logFilePath) => {
  const tail = new Tail(logFilePath, {
    useWatchFile: true,
    fsWatchOptions: { interval: 200 }
  });

  tail.on('line', function(data) {
    const pubObj = {};
    pubObj[logName] = {
      from: logFilePath,
      data
    };
    // signale.debug('publish object:', pubObj);
    pubsub.publish(logName, pubObj);
  });

  tail.on('error', function(error) {
    signale.error(error);
  });

  signale.await(`Monitoring started for file '${logFilePath}'`);

  return tail;
};

const stopMonitorLogFiles = () => {
  for (let i = 0; i < logFilesTailObjects.length; i++) {
    const el = logFilesTailObjects[i];
    el.unwatch();
    signale.complete(`Monitoring stopped for file '${el.filename}'`);
  }
  logFilesTailObjects = [];
};

const startMonitorLogFiles = () => {
  stopMonitorLogFiles();
  const logFiles = logFilesConfig();
  Object.keys(logFiles).forEach(el => {
    logFilesTailObjects.push(createNewLogMonitor(el, logFiles[el]));
  });
};

exports.stopMonitorLogFiles = stopMonitorLogFiles;
exports.startMonitorLogFiles = startMonitorLogFiles;
exports.logFilesTailObjects = logFilesTailObjects;
