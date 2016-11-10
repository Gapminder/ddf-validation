'use strict';

const registry = require('../registry');
const emptyData = require('./empty-data');
const unexpectedData = require('./unexpected-data');
const wrongDataPointHeader = require('./wrong-data-point-header');
const incorrectIdentifier = require('./incorrect-identifier');
const incorrectJsonField = require('./incorrect-json-field');
const nonDdfFolder = require('./non-ddf-folder');
const nonDdfDataset = require('./non-ddf-dataset');

module.exports = {
  [registry.EMPTY_DATA]: emptyData.rule,
  [registry.UNEXPECTED_DATA]: unexpectedData.rule,
  [registry.NON_DDF_DATA_SET]: nonDdfDataset.rule,
  [registry.NON_DDF_FOLDER]: nonDdfFolder.rule,
  [registry.WRONG_DATA_POINT_HEADER]: wrongDataPointHeader.rule,
  [registry.INCORRECT_IDENTIFIER]: incorrectIdentifier.rule,
  [registry.INCORRECT_JSON_FIELD]: incorrectJsonField.rule
};
