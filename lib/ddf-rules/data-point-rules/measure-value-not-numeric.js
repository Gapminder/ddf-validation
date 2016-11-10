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
  rule: dataPointFileDescriptor =>
    dataPointFileDescriptor.dataPointDetail.measures
      .filter(measure => isNotNumeric(dataPointFileDescriptor.dataPointRecord[measure]))
      .map(measure => new Issue(registry.MEASURE_VALUE_NOT_NUMERIC)
        .setPath(dataPointFileDescriptor.dataPointDetail.fullPath)
        .setData({
          measure,
          line: dataPointFileDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointFileDescriptor.dataPointRecord[measure]
        }))
};
