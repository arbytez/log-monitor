const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname);

let logFiles = null;

const readConfigs = () => {
  const logFilesData = fs.readFileSync(path.join(configPath, 'logFiles.json'));

  logFiles = JSON.parse(logFilesData);
};

const logFilesConfig = () => {
  if (!logFiles) readConfigs();
  return logFiles;
};

exports.readConfigs = readConfigs;
exports.logFilesConfig = logFilesConfig;
