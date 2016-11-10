'use strict';

const registry = require('../registry');

const measureValueNotNumeric = require('./measure-value-not-numeric');
const unexpectedEntityValue = require('./unexpected-entity-value');
const unexpectedTimeValue = require('./unexpected-time-value');

module.exports = {
  [registry.MEASURE_VALUE_NOT_NUMERIC]: measureValueNotNumeric.rule,
  [registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: unexpectedEntityValue.rule,
  [registry.DATA_POINT_UNEXPECTED_TIME_VALUE]: unexpectedTimeValue.rule
};
