'use strict';

const ddfTimeUtils = require('ddf-time-utils');
const registry = require('../registry');
const constants = require('../../ddf-definitions/constants');
const Issue = require('../issue');
const shared = require('./shared');

module.exports = {
  recordRule: dataPointDescriptor =>
    shared.cacheFor.keysByType(dataPointDescriptor, 'time')
      .filter(timeKey => !ddfTimeUtils.detectTimeType(dataPointDescriptor.record[timeKey]))
      .map(timeKey => new Issue(registry.DATA_POINT_UNEXPECTED_TIME_VALUE)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData({
          concept: timeKey,
          line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.record[timeKey]
        }))
};
