'use strict';
const _ = require('lodash');

const errorCodes = require('./ddf-error-codes');
const logger = require('../utils/logger');

module.exports = (folder, ddfFoldersCount, foldersCount) => {
  if (ddfFoldersCount === 0) {
    logger.log(errorCodes.err_folder_is_not_ddf_folder.message(folder));
    if (foldersCount === 1) {
      logger.log(errorCodes.err_folder_has_no_subfolders.message(folder));
      return false
    }
    logger.log(errorCodes.err_folder_has_no_ddf_subfolders.message(folder));
    return false;
  }

  return true;
};

