'use strict';

const parseDecimalNumber = require('parse-decimal-number');
const registry = require('../registry');
const Issue = require('../issue');
const constants = require('../../ddf-definitions/constants');

function isNotNumeric(valueParam) {
  const value = typeof valueParam === 'string' ? valueParam : `${valueParam}`;

  return isNaN(parseDecimalNumber(value));
}

module.exports = {
  rule: dataPointDescriptor => dataPointDescriptor.dataPointFileDescriptor.measures
    .filter(measure => isNotNumeric(dataPointDescriptor.dataPointRecord[measure]))
    .map(measure => new Issue(registry.MEASURE_VALUE_NOT_NUMERIC)
      .setPath(dataPointDescriptor.dataPointFileDescriptor.fullPath)
      .setData({
        measure,
        line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
        value: dataPointDescriptor.dataPointRecord[measure]
      }))
};
