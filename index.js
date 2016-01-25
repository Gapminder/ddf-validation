'use strict';

// from args
//let folder = '~/work/gapminder/open-numbers/ddf--gapminder--systema_globalis';
let folder = '~/work/gapminder';

const fs = require('fs');
const path = require('path');

const errorCodes = require('./lib/ddf-error-codes');
const logger = require('./utils/logger');

const normalizedPath = require('./utils/path-normilize')(folder);

if (!require('./utils/path-exists-sync')(normalizedPath)) {
  logger.log(errorCodes.err_folder_not_found.message(folder));
  return;
}

const files$ = require('./utils/rx-recursive-readdir')(normalizedPath);

const folders$ = files$
  .filter(file => fs.lstatSync(file).isDirectory());

const $ddfFolders = folders$
  .filter(folder => require('./utils/path-is-ddf-folder-sync')(folder));

// validate ddf folders
$ddfFolders
  .count()
  .subscribe(ddfFoldersCount=> {
    if (ddfFoldersCount === 0) {
      logger.log(errorCodes.err_folder_is_not_ddf_folder.message(folder));
      folders$.count().subscribe(foldersCount=> {
        if (foldersCount === 1) {
          return logger.log(errorCodes.err_folder_has_no_subfolders.message(folder));
        }
        logger.log(errorCodes.err_folder_has_no_ddf_subfolders.message(folder));
      });
      return;
    }
    const plural = ddfFoldersCount === 1 ? '' : 's';
    logger.log(`Found ${ddfFoldersCount} DDF folder${plural}, processing...`);
    logger.log('DDF folders:');
    $ddfFolders.subscribe(folder=>logger.log(folder));
  });
