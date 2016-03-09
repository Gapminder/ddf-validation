'use strict';

const args = require('./args');
const settings = args.getSettings();

module.exports = {
  settings,
  ddfRootFolder: args.getDDFRootFolder()
};

/*
 getLogger: () => require('./logger')(settings)
 */
