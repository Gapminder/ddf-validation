'use strict';
const path = require('path');
const pathExistsSync = require('./path-exists-sync');
const ddfFileNames = require('../common/ddf-file-names');

// ddf required files

module.exports = folder => {
  return pathExistsSync(ddfPath(folder, ddfFileNames.index)) &&
    pathExistsSync(ddfPath(folder, ddfFileNames.measures)) &&
    pathExistsSync(ddfPath(folder, ddfFileNames.dimensions));
};

function ddfPath(folder, file) {
  return path.resolve(folder, file);
}

