'use strict';
const _ = require('lodash');
const fs = require('fs');

const errorCodes = require('./error-codes');
const logger = require('../utils/logger');

const pathExists = require('../utils/path-exists-sync');
const pathGetSubfolders = require('../utils/path-get-subfolders-sync');
const pathIsDdfFolder = require('../utils/path-is-ddf-folder-sync');

module.exports = folder => {
  if (!pathExists(folder)){
    logger.log(errorCodes.err_folder_not_found.message(folder));
    return false;
  }
  if (!pathIsDdfFolder(folder)) {
    var subfolders = pathGetSubfolders(folder);
    if (_.isEmpty(subfolders)) {
      logger.log(errorCodes.err_folder_is_not_ddf_folder.message(folder));
      logger.log(errorCodes.err_folder_has_no_subfolders.message(folder));
      return false;
    }

    if (!_.find(subfolders, pathIsDdfFolder)) {
      logger.log(errorCodes.err_folder_is_not_ddf_folder.message(folder));
      logger.log(errorCodes.err_folder_has_no_ddf_subfolders.message(folder));
      return false;
    }
  }
  return true;
};

