'use strict';
const _ = require('lodash');
const Rx = require('rxjs');
const path = require('path');

const ddfDimensionsSchema = require('../ddf-schema/ddf-dimensions.schema');
const readCsvFileToJson = require('../utils/rx-read-csv-file-to-json');

var ajv = require('ajv')({v5: true, allErrors: true});
// todo: add file name
module.exports = fileNames$ => {
  return fileNames$
  // filter out only dimensions file name
    .filter(fileName => ddfDimensionsSchema.fileName === path.basename(fileName))
    // it should be only one dimensions file per folder
    // but it could several form different folders
    .map(fileName => {
      return {
        name: fileName,
        content$: readCsvFileToJson(fileName)
      };
    })

    //for each dimension file
    //dimensionFiles
    .map(file => {
      let dimensionFile = file.content$;
      // csv header, ['column1', ''column12']
      let header = dimensionFile.take(1).first();
      // csv rows, [{ col1:val1, col2:val2 }, { col1:val1, col2:val2 }]
      let rows = header.mergeMapTo(dimensionFile.skip(1), _.zipObject);

      // validate header
      let isHeaderValid = header
        .map((item, index) => {
          // validate header: required columns
          // validate header: unknown columns
          // validate header: duplicate columns
          let headerValues = Object.keys(ddfDimensionsSchema.schema.properties);
          let headerSchema = {
            type: 'array',
            items: {type: 'string', enum: headerValues},
            minItems: headerValues.length,
            maxItems: headerValues.length,
            uniqueItems: true
          };

          let validate = ajv.compile(headerSchema);
          let isValid = validate(item);
          return {
            valid: isValid,
            errors: validate.errors,
            index: index,
            row: item
          };
        })
        .filter(item=>!item.valid)
        //.subscribe(i=>console.log(i));

      // validate concept id uniqueness
      let isConceptIdUnique = rows
        .pluck('concept')
        .toArray()
        .map((item, index) => {
          let uniqueColumnSchema = {
            type: 'array',
            items: {type: 'string'},
            uniqueItems: true
          };
          let validate = ajv.compile(uniqueColumnSchema);
          let isValid = validate(item);
          return {
            valid: isValid,
            errors: validate.errors,
            index: index,
            row: item
          };
        })
        .filter(item=>!item.valid)
        //.subscribe(i=>console.log(i));

      // validate rows
      var isRowsValid = rows
        .map((row, index) => {
          let validate = ajv.compile(ddfDimensionsSchema.schema);
          let isValid = validate(row);
          return {
            valid: isValid,
            errors: validate.errors,
            index: index,
            row: row
          };
        })
        .filter(item=>!item.valid)
        //.subscribe(i=>console.log(i));

      //return [isHeaderValid, isConceptIdUnique, isRowsValid]
      //return Rx.Observable
      //  .join(isHeaderValid, isConceptIdUnique, isRowsValid)
        //.flatMap(x=>console.log('x',x));
      return isHeaderValid
        .merge(isConceptIdUnique)
        .merge(isRowsValid)
        //.map(x=>console.log('map',x))
    })

    // run sequence
    .subscribe(x => {
      console.log(x);
      //x.subscribe(i => console.log(i),i => console.log(i),i => console.log(i));
      x.subscribe()
    },i => console.log(i),i => console.log(i));
};
