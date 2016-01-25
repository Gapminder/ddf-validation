'use strict';
const logger = require('../utils/logger');
const readCsv = require('../utils/rx-read-csv-file-to-json');
const measureValuesSchema = require('../ddf-schema/ddf-measure-values.schema');

// header validation
var ajv = require('ajv')({v5: true, allErrors: true});
var headerSchema = {
  type: 'array',
  items: {type: 'string'},
  minItems: 1, uniqueItems: true
};
module.exports = filePath => {
  var csv = readCsv(filePath);
  var header = csv.take(1).first();
  //console.log(header)
  var rows = csv.skip(1);

  // ? validate header: is valid gapminder id
  // validate rows: unique ids
  // validate rows: is valid gapminder ids
  // validate rows: column value type

  //if (measureValuesSchema.fileExp.test(filePath)) {
  //  header.contains()
  //}
  // validate header
  return header.map(row=> {
    let valid = ajv.validate(headerSchema, row);
    return {
      valid: valid,
      data: row,
      file: filePath,
      error: ajv.errorsText()
    }
  });
  //let validation = header.subscribe(item => console.log(item), null, item => console.log(item));
  //return header;
};