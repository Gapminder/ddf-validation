'use strict';

const ddfDimensionsSchema = require('../ddf-schema/ddf-dimensions.schema');
const rxReadDdfFile = require('../utils/rx-read-ddf-csv');
module.exports = folderPath => rxReadDdfFile(folderPath, ddfDimensionsSchema.fileName);