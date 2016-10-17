'use strict';

const registry = require('../registry');
const unexpectedData = require('./unexpected-data');
const emptyData = require('./empty-data');
const wrongDataPointHeader = require('./wrong-data-point-header');
const incorrectIdentifier = require('./incorrect-identifier');
const filenameDoesNotMatchHeader = require('./filename-does-not-match-header');
const incorrectJsonField = require('./incorrect-json-field');
const nonDdfFolder = require('./non-ddf-folder');
const nonDdfDataset = require('./non-ddf-dataset');

module.exports = {
  [registry.UNEXPECTED_DATA]: unexpectedData.rule,
  [registry.EMPTY_DATA]: emptyData.rule,
  [registry.NON_DDF_DATA_SET]: nonDdfDataset.rule,
  [registry.NON_DDF_FOLDER]: nonDdfFolder.rule,
  [registry.WRONG_DATA_POINT_HEADER]: wrongDataPointHeader.rule,
  [registry.INCORRECT_IDENTIFIER]: incorrectIdentifier.rule,
  [registry.FILENAME_DOES_NOT_MATCH_HEADER]: filenameDoesNotMatchHeader.rule,
  [registry.INCORRECT_JSON_FIELD]: incorrectJsonField.rule
};
