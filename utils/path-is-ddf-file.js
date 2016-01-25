'use strict';
const path = require('path');
const dimensionsSchema = require('../ddf-schema/ddf-dimensions.schema');
const measureValuesSchema = require('../ddf-schema/ddf-measure-values.schema');

module.exports = filePath => {
  const fileName = path.basename(filePath);
  if (dimensionsSchema.fileExp.test(fileName)) {
    return true;
  }
  if (measureValuesSchema.fileExp.test(fileName)) {
    return true;
  }
  return false;
};
