'use strict';
const fs = require('fs');
const errorCodes = require('./ddf-error-codes');

class Validator {
  constructor(logger, folder) {
    this.logger = logger;
    this.folder = folder;
    const normalizedPath = require('../utils/path-normilize')(folder);

    if (!require('../utils/path-exists-sync')(normalizedPath)) {
      logger.error(errorCodes.err_folder_not_found.message(folder));
      return;
    }

    const files$ = require('../utils/rx-recursive-readdir')(normalizedPath);
    if (files$ === null ) {
      logger.error(errorCodes.err_folder_not_found.message(folder));
      return;
    }

    this.folders$ = files$
      .filter(file => fs.lstatSync(file).isDirectory());
    this.ddfFolders$ = this.folders$
      .filter(folder => require('../utils/path-is-ddf-folder-sync')(folder));
  }

  getValidator() {
    return this.ddfFolders$.count()
      .combineLatest([this.ddfFolders$.toArray(), this.folders$.count()],
        (ddfFoldersCount, ddfFolders, foldersCount) => {
          return {ddfFolders, ddfFoldersCount, foldersCount};
        });
  };

  // todo: look into it later: incorrect `this` in function under subscribe
  static validate(context) {
    return res => {
      if (res.ddfFoldersCount === 0) {
        context.logger.error(errorCodes.err_folder_is_not_ddf_folder.message(context.folder));

        if (res.foldersCount === 1) {
          context.logger.error(errorCodes.err_folder_has_no_subfolders.message(context.folder));
          return;
        }

        context.logger.error(errorCodes.err_folder_has_no_ddf_subfolders.message(context.folder));
        return;
      }

      const plural = res.ddfFoldersCount === 1 ? '' : 's';
      context.logger.notice(`Found ${res.ddfFoldersCount} DDF folder${plural}, processing...:`);
      context.logger.notice(res.ddfFolders);
    }
  }
}

module.exports = Validator;
