'use strict';

const ddfIndexSchema = require('../ddf-schema/ddf-index.schema');
const rxReadDdfFile = require('../utils/rx-read-ddf-csv');
module.exports = folderPath => rxReadDdfFile(folderPath, ddfIndexSchema.fileName);