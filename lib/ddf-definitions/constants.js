'use strict';

exports.CONCEPT = Symbol.for('concepts');
exports.ENTITY = Symbol.for('entities');
exports.DATA_POINT = Symbol.for('datapoints');

exports.LINE_NUM_INCLUDING_HEADER = 2;

exports.DDF_SEPARATOR = '--';
exports.DDF_DATAPOINT_SEPARATOR = 'by';
exports.CONCEPT_ID_KEY = 'concept';
exports.CONCEPT_TYPE_KEY = 'concept_type';
exports.PREDEFINED_CONCEPTS = [exports.CONCEPT_ID_KEY, exports.CONCEPT_TYPE_KEY];
