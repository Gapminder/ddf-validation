'use strict';

const ddfMeasuresSchema = require('../ddf-schema/ddf-measures.schema');
const rxReadDdfFile = require('../utils/rx-read-ddf-csv');
module.exports = folderPath => rxReadDdfFile(folderPath, ddfMeasuresSchema.fileName);