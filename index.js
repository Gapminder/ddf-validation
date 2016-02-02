#! /usr/bin/env node
'use strict';

// from args
var userArgs = process.argv.slice(2);
let folder = userArgs[0] || process.cwd();

const fs = require('fs');
const path = require('path');
const rx = require('rxjs');
require('console.table');

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
      // validate dimensions file
      const dimensionsFile$ = require('./ddf-utils/rx-read-dimension')(folderPath);
      const isDimensionsValid = require('./lib/ddf-dimensions.validator')(folderPath, dimensionsFile$);

      // validate measures file
      const measuresFile$ = require('./ddf-utils/rx-read-measures')(folderPath);
      const isMeasuresValid = require('./lib/ddf-measures.validator')(folderPath, measuresFile$);

      // validate dimensions&measures unique ids
      const isIdUnique = require('./lib/ddf-dimensions-and-measures-unique-id.validator.js')
      (folderPath, dimensionsFile$, measuresFile$);

      return isDimensionsValid
        .combineLatest([isMeasuresValid, isIdUnique], (a, b, c)=> {
          const d = a.concat(b).concat(c);
          console.table(d);
          return d;
        });
    })
    //.do(x=>console.log(x))
    .subscribe(x=>x.subscribe(), x=>console.error(x.stack));
}