'use strict';
const path = require('path');
const pathExistsSync = require('./path-exists-sync');

const ddfIndexSchema = require('../ddf-schema/ddf-index.schema');
const ddfDimensionsSchema = require('../ddf-schema/ddf-dimensions.schema');
const ddfMeasuresSchema = require('../ddf-schema/ddf-measures.schema');

// check ddf required files
module.exports = folder => {
  return pathExistsSync(ddfPath(folder, ddfIndexSchema.fileName)) &&
    pathExistsSync(ddfPath(folder, ddfMeasuresSchema.fileName)) &&
    pathExistsSync(ddfPath(folder, ddfDimensionsSchema.fileName));
};

function ddfPath(folder, file) {
  return path.resolve(folder, file);
}

