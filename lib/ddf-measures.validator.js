'use strict';
const _ = require('lodash');

var ajv = require('ajv')({v5: true, allErrors: true});

const ddfMeasuresSchema = require('../ddf-schema/ddf-measures.schema');
const logger = require('../utils/logger');

const fileName = ddfMeasuresSchema.fileName;

module.exports = (folderPath, measureFiles) => {
  // csv header, ['column1', ''column12']
  let header = measureFiles.take(1).first();
  // csv rows, [{ col1:val1, col2:val2 }, { col1:val1, col2:val2 }]
  let rows = header.mergeMapTo(measureFiles.skip(1), _.zipObject);

  // validate header
  // validate header: required columns
  // validate header: unknown columns
  // validate header: duplicate columns
  const isHeaderValid$ = header
    .map((entry, index) => {
      const headerValues = Object.keys(ddfMeasuresSchema.schema.properties);
      const headerSchema = {
        type: 'array',
        items: {type: 'string', enum: headerValues},
        minItems: headerValues.length,
        maxItems: headerValues.length,
        uniqueItems: true
      };

      const validate = ajv.compile(headerSchema);
      const isValid = validate(entry);
      const errors = validate.errors;
      return {folderPath, fileName, isValid,errors, index, entry};
    });

  // validate concept id uniqueness
  const isConceptIdUnique$ = rows
    .pluck(ddfMeasuresSchema.gid)
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
      return {folderPath, fileName, isValid,errors, index, entry};
    });

  // validate rows
  const isRowsValid$ = rows
    .map((entry, index) => {
      const validate = ajv.compile(ddfMeasuresSchema.schema);
      const isValid = validate(entry);
      const errors = validate.errors;
      return {folderPath, fileName, isValid,errors, index, entry};
    });

  return isHeaderValid$.combineLatest([isConceptIdUnique$, isRowsValid$.toArray()],
    (isHeaderValid, isConceptIdUnique, isRowsValid)=> {
      let errors = [];
      if (!isHeaderValid.isValid) {
        logger.log('header is not valid', isHeaderValid.errors[0].message);
        isHeaderValid.errors = JSON.stringify(isHeaderValid.errors);
        errors.push(isHeaderValid);
      }
      if (!isConceptIdUnique.isValid) {
        logger.log('concept id is not unique', isConceptIdUnique.errors[0].message);
        isConceptIdUnique.errors = JSON.stringify(isConceptIdUnique.errors);
        errors.push(isConceptIdUnique);
      }
      isRowsValid.forEach(isRowValid=>{
        if (!isRowValid.isValid) {
          logger.log('entry is not valid', isRowValid.errors[0].message);
          isRowValid.errors = JSON.stringify(isRowValid.errors);
          errors.push(isRowValid);
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
    });
};