'use strict';

const args = require('./args');
const settings = args.getSettings();
const logger = require('./logger')(settings);
const ddfRootFolder = args.getDDFRootFolder();

module.exports = {
  settings,
  ddfRootFolder,
  logger
};
