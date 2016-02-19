'use strict';
const _ = require('lodash');

const errorCodes = require('./ddf-error-codes');
const utils = require('../utils');
const logger = utils.getLogger();
const folder = utils.ddfRootFolder;

module.exports = (ddfFoldersCount, foldersCount) => {
  if (ddfFoldersCount === 0) {
    logger.notice(errorCodes.err_folder_is_not_ddf_folder.message(folder));
    if (foldersCount === 1) {
      logger.notice(errorCodes.err_folder_has_no_subfolders.message(folder));
      return false;
    }
    logger.notice(errorCodes.err_folder_has_no_ddf_subfolders.message(folder));
    return false;
  }

  return true;
};
