'use strict';
const _ = require('lodash');
const ajv = require('ajv')({v5: true, allErrors: true});
const logger = require('../utils/logger');

const ddfDimensionsSchema = require('../ddf-schema/ddf-dimensions.schema');
const ddfMeasuresSchema = require('../ddf-schema/ddf-measures.schema');

module.exports = (folderPath, dimensionsFile$, measuresFile$) => {

  const fileName = [ddfDimensionsSchema.fileName, ddfMeasuresSchema.fileName]
    .join(',');
  // csv rows, [{ col1:val1, col2:val2 }, { col1:val1, col2:val2 }]
  const dimensionsRows = dimensionsFile$.take(1).first().mergeMapTo(dimensionsFile$.skip(1), _.zipObject);
// csv rows, [{ col1:val1, col2:val2 }, { col1:val1, col2:val2 }]
  const measuresRows = measuresFile$.take(1).first().mergeMapTo(measuresFile$.skip(1), _.zipObject);

  return dimensionsRows.pluck(ddfDimensionsSchema.gid)
    .merge(measuresRows.pluck(ddfMeasuresSchema.gid))
    .toArray()
    .map((entry, index) => {
      const uniqueColumnSchema = {
        type: 'array',
        items: {type: 'string'},
        uniqueItems: true
      };
      const validate = ajv.compile(uniqueColumnSchema);
      const isValid = validate(entry);
      const errors = validate.errors;
      return {folderPath, fileName, isValid, errors, index, entry};
    })
    .toArray()
    .map(valids => {
      let errors = [];
      valids.forEach(valid=>{
        if (!valid.isValid){
          logger.log('concept id is not unique', valid.errors[0].message);
          valid.errors = JSON.stringify(valid.errors);
          errors.push(valid);
        }
      });
      if (errors.length === 0) {
        logger.log(`${fileName} in ${folderPath} is valid`);
        return [{
          fileName: fileName,
          folder: folderPath,
          valid: true
        }];
      } else {
        return errors;
      }
    })
};