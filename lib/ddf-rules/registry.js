'use strict';

exports.NON_DDF_DATA_SET = Symbol.for('NON_DDF_DATA_SET');
exports.NON_DDF_FOLDER = Symbol.for('NON_DDF_FOLDER');
exports.INDEX_IS_NOT_FOUND = Symbol.for('INDEX_IS_NOT_FOUND');
exports.INCORRECT_FILE = Symbol.for('INCORRECT_FILE');
exports.INCORRECT_JSON_FIELD = Symbol.for('INCORRECT_JSON_FIELD');
exports.CONCEPT_ID_IS_NOT_UNIQUE = Symbol.for('CONCEPT_ID_IS_NOT_UNIQUE');
exports.DATA_POINT_VALUE_NOT_NUMERIC = Symbol.for('DATA_POINT_VALUE_NOT_NUMERIC');
exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_ENTITY_VALUE');
exports.DATA_POINT_UNEXPECTED_TIME_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_TIME_VALUE');
exports.WRONG_ENTITY_IS_HEADER = Symbol.for('WRONG_ENTITY_IS_HEADER');
exports.WRONG_ENTITY_IS_VALUE = Symbol.for('WRONG_ENTITY_IS_VALUE');

exports.descriptions = {
  [exports.NON_DDF_DATA_SET]: 'This data set is not DDF',
  [exports.NON_DDF_FOLDER]: 'This folder is not DDF',
  [exports.INDEX_IS_NOT_FOUND]: 'Index is not found',
  [exports.INCORRECT_FILE]: 'Incorrect file',
  [exports.INCORRECT_JSON_FIELD]: 'Incorrect JSON field',
  [exports.CONCEPT_ID_IS_NOT_UNIQUE]: 'Concept Id is not unique',
  [exports.DATA_POINT_VALUE_NOT_NUMERIC]: 'Measure in data point has not numeric type',
  [exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: 'Unexpected entity value in the data point',
  [exports.DATA_POINT_UNEXPECTED_TIME_VALUE]: 'Unexpected time value in the data point',
  [exports.WRONG_ENTITY_IS_HEADER]: 'Wrong "is" header',
  [exports.WRONG_ENTITY_IS_VALUE]: 'Wrong value for "is" header'
};
