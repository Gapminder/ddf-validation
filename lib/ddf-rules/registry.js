'use strict';

exports.UNEXPECTED_DATA = Symbol.for('UNEXPECTED_DATA');
exports.EMPTY_DATA = Symbol.for('EMPTY_DATA');
exports.NON_DDF_DATA_SET = Symbol.for('NON_DDF_DATA_SET');
exports.NON_DDF_FOLDER = Symbol.for('NON_DDF_FOLDER');
exports.INDEX_IS_NOT_FOUND = Symbol.for('INDEX_IS_NOT_FOUND');
exports.INCORRECT_FILE = Symbol.for('INCORRECT_FILE');
exports.INCORRECT_JSON_FIELD = Symbol.for('INCORRECT_JSON_FIELD');
exports.CONCEPT_ID_IS_NOT_UNIQUE = Symbol.for('CONCEPT_ID_IS_NOT_UNIQUE');
exports.EMPTY_CONCEPT_ID = Symbol.for('EMPTY_CONCEPT_ID');
exports.INCORRECT_IDENTIFIER = Symbol.for('INCORRECT_IDENTIFIER');
exports.NON_CONCEPT_HEADER = Symbol.for('NON_CONCEPT_HEADER');
exports.INVALID_DRILL_UP = Symbol.for('INVALID_DRILL_UP');
exports.MEASURE_VALUE_NOT_NUMERIC = Symbol.for('MEASURE_VALUE_NOT_NUMERIC');
exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_ENTITY_VALUE');
exports.DATA_POINT_UNEXPECTED_TIME_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_TIME_VALUE');
exports.WRONG_DATA_POINT_HEADER = Symbol.for('WRONG_DATA_POINT_HEADER');
exports.WRONG_ENTITY_IS_HEADER = Symbol.for('WRONG_ENTITY_IS_HEADER');
exports.WRONG_ENTITY_IS_VALUE = Symbol.for('WRONG_ENTITY_IS_VALUE');
exports.NON_UNIQUE_ENTITY_VALUE = Symbol.for('NON_UNIQUE_ENTITY_VALUE');
exports.FILENAME_DOES_NOT_MATCH_HEADER = Symbol.for('FILENAME_DOES_NOT_MATCH_HEADER');
exports.CONCEPT_MANDATORY_FIELD_NOT_FOUND = Symbol.for('CONCEPT_MANDATORY_FIELD_NOT_FOUND');
exports.CONCEPTS_NOT_FOUND = Symbol.for('CONCEPTS_NOT_FOUND');
exports.WRONG_INDEX_KEY = Symbol.for('WRONG_INDEX_KEY');
exports.WRONG_INDEX_VALUE = Symbol.for('WRONG_INDEX_VALUE');

exports.WARNING_TAG = Symbol.for('WARNING');
exports.WAFFLE_SERVER_TAG = Symbol.for('WAFFLE_SERVER');
exports.FILE_SYSTEM_TAG = Symbol.for('FILE_SYSTEM');
exports.DATAPOINT_TAG = Symbol.for('DATAPOINT');

function tagsToString(tags) {
  return tags.map(tag => Symbol.keyFor(tag));
}

exports.tags = {
  [exports.UNEXPECTED_DATA]: [exports.FILE_SYSTEM_TAG, exports.WAFFLE_SERVER_TAG],
  [exports.EMPTY_DATA]: [exports.WARNING_TAG],
  [exports.NON_DDF_DATA_SET]: [exports.FILE_SYSTEM_TAG],
  [exports.NON_DDF_FOLDER]: [exports.WARNING_TAG, exports.FILE_SYSTEM_TAG],
  [exports.INDEX_IS_NOT_FOUND]: [exports.WARNING_TAG, exports.FILE_SYSTEM_TAG],
  [exports.INCORRECT_FILE]: [exports.FILE_SYSTEM_TAG],
  [exports.INCORRECT_JSON_FIELD]: [exports.WARNING_TAG],
  [exports.CONCEPT_ID_IS_NOT_UNIQUE]: [exports.WAFFLE_SERVER_TAG],
  [exports.EMPTY_CONCEPT_ID]: [exports.WAFFLE_SERVER_TAG],
  [exports.INCORRECT_IDENTIFIER]: [exports.WAFFLE_SERVER_TAG],
  [exports.NON_CONCEPT_HEADER]: [exports.WAFFLE_SERVER_TAG],
  [exports.INVALID_DRILL_UP]: [exports.WAFFLE_SERVER_TAG],
  [exports.MEASURE_VALUE_NOT_NUMERIC]: [exports.WARNING_TAG, exports.DATAPOINT_TAG],
  [exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: [exports.WAFFLE_SERVER_TAG, exports.DATAPOINT_TAG],
  [exports.DATA_POINT_UNEXPECTED_TIME_VALUE]: [exports.WAFFLE_SERVER_TAG, exports.DATAPOINT_TAG],
  [exports.WRONG_DATA_POINT_HEADER]: [exports.WAFFLE_SERVER_TAG, exports.DATAPOINT_TAG],
  [exports.WRONG_ENTITY_IS_HEADER]: [],
  [exports.WRONG_ENTITY_IS_VALUE]: [],
  [exports.NON_UNIQUE_ENTITY_VALUE]: [exports.WAFFLE_SERVER_TAG],
  [exports.FILENAME_DOES_NOT_MATCH_HEADER]: [exports.WAFFLE_SERVER_TAG],
  [exports.CONCEPT_MANDATORY_FIELD_NOT_FOUND]: [exports.WAFFLE_SERVER_TAG],
  [exports.CONCEPTS_NOT_FOUND]: [exports.WAFFLE_SERVER_TAG],
  [exports.WRONG_INDEX_KEY]: [],
  [exports.WRONG_INDEX_VALUE]: []
};

exports.descriptions = {
  [exports.UNEXPECTED_DATA]: 'Unexpected data: wrong CSV',
  [exports.EMPTY_DATA]: 'Empty data',
  [exports.NON_DDF_DATA_SET]: 'This data set is not DDF',
  [exports.NON_DDF_FOLDER]: 'This folder is not DDF',
  [exports.INDEX_IS_NOT_FOUND]: 'Index is not found',
  [exports.INCORRECT_FILE]: 'Incorrect file',
  [exports.INCORRECT_JSON_FIELD]: 'Incorrect JSON field',
  [exports.CONCEPT_ID_IS_NOT_UNIQUE]: 'Concept Id is not unique',
  [exports.EMPTY_CONCEPT_ID]: 'Empty concept ID',
  [exports.INCORRECT_IDENTIFIER]: 'Incorrect identifier',
  [exports.NON_CONCEPT_HEADER]: 'Non concept header',
  [exports.INVALID_DRILL_UP]: 'Invalid Drill Up',
  [exports.MEASURE_VALUE_NOT_NUMERIC]: 'Measure in data point has not numeric type',
  [exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: 'Unexpected entity value in the data point',
  [exports.DATA_POINT_UNEXPECTED_TIME_VALUE]: 'Unexpected time value in the data point',
  [exports.WRONG_DATA_POINT_HEADER]: 'Invalid concept in data point',
  [exports.WRONG_ENTITY_IS_HEADER]: 'Wrong "is" header',
  [exports.WRONG_ENTITY_IS_VALUE]: 'Wrong value for "is" header',
  [exports.NON_UNIQUE_ENTITY_VALUE]: 'Non unique entity value',
  [exports.FILENAME_DOES_NOT_MATCH_HEADER]: 'Filename does not match to header of this file',
  [exports.CONCEPT_MANDATORY_FIELD_NOT_FOUND]: 'Concept mandatory field is not found',
  [exports.CONCEPTS_NOT_FOUND]: 'Concepts are not found',
  [exports.WRONG_INDEX_KEY]: 'Wrong Index key',
  [exports.WRONG_INDEX_VALUE]: 'Wrong Index value'
};

exports.getRulesInformation = () => Object.getOwnPropertySymbols(exports.descriptions)
  .reduce((result, issueType) =>
    `${result}${Symbol.keyFor(issueType)} -> ${exports.descriptions[issueType]}
      tags: ${tagsToString(exports.tags[issueType])}\n\n`, 'Supported rules are:\n\n');
