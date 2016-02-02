'use strict';

// from args
let folder = '~/work/gapminder/open-numbers/ddf--gapminder--systema_globalis';
//let folder = '~/work/gapminder';

const fs = require('fs');
const path = require('path');
const rx = require('rxjs');

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

const ddfFolders$ = folders$
  .filter(folder => require('./utils/path-is-ddf-folder-sync')(folder));

// validate list of ddf folders
ddfFolders$.count()
  .combineLatest([ddfFolders$.toArray(), folders$.count()],
    (ddfFoldersCount, ddfFolders, foldersCount)=> {
      return {ddfFolders, ddfFoldersCount, foldersCount};
    })
  .subscribe(res => {
    const isFolderValid = require('./lib/ddf-root-folder.validator.js')
    (folder, res.ddfFoldersCount, res.foldersCount);

    if (!isFolderValid) {
      return;
    }

    const plural = res.ddfFoldersCount === 1 ? '' : 's';
    logger.log(`Found ${res.ddfFoldersCount} DDF folder${plural}, processing...:`);
    logger.log(res.ddfFolders);

    return validateDdfFolder(ddfFolders$);
  }, err => console.error(err));

// validate each ddfFolder
function validateDdfFolder(ddfFolders$) {
  ddfFolders$
    .do(x=>console.log('Validating ddf folder', x))
    .map(folderPath => {
      var dimensionsFile$ = require('./ddf-utils/rx-read-dimension')(folderPath);
      require('./lib/ddf-dimensions.validator')(folderPath, dimensionsFile$)
        //.do(x=>console.log(x))
        .subscribe(x=>x,x=>console.error(x));

      var measuresFile$ = require('./ddf-utils/rx-read-measures')(folderPath);
      require('./lib/ddf-measures.validator')(folderPath, measuresFile$)
        //.do(x=>console.log(x))
        .subscribe(x=>x,x=>console.error(x.stack));


      return measuresFile$;
    }).subscribe()
    //.do(x=>console.log(x))
    //.subscribe();
}

