'use strict';

exports.INDEX_IS_NOT_FOUND = Symbol.for('INDEX_IS_NOT_FOUND');
exports.INCORRECT_FILE = Symbol.for('INCORRECT_FILE');
exports.CONCEPT_ID_IS_NOT_UNIQUE = Symbol.for('CONCEPT_ID_IS_NOT_UNIQUE');
exports.ENTITY_HEADER_IS_NOT_CONCEPT = Symbol.for('ENTITY_HEADER_IS_NOT_CONCEPT');
exports.DATA_POINT_VALUE_NOT_NUMERIC = Symbol.for('DATA_POINT_VALUE_NOT_NUMERIC');
exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_ENTITY_VALUE');

exports.descriptions = {
  [exports.INDEX_IS_NOT_FOUND]: 'Index is not found',
  [exports.INCORRECT_FILE]: 'Incorrect file',
  [exports.CONCEPT_ID_IS_NOT_UNIQUE]: 'Concept Id is not unique',
  [exports.ENTITY_HEADER_IS_NOT_CONCEPT]: 'Entity header is not correct',
  [exports.DATA_POINT_VALUE_NOT_NUMERIC]: 'Measure in data point has not numeric type',
  [exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: 'Unexpected entity value in the data point'
};
