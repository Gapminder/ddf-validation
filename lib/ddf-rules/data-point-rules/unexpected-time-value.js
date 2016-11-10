'use strict';

const ddfTimeUtils = require('ddf-time-utils');
const registry = require('../registry');
const constants = require('../../ddf-definitions/constants');
const Issue = require('../issue');
const shared = require('./shared');

module.exports = {
  rule: dataPointFileDescriptor =>
    shared.cacheFor.keysByType(dataPointFileDescriptor, 'time')
      .filter(timeKey =>
        !ddfTimeUtils.detectTimeType(dataPointFileDescriptor.dataPointRecord[timeKey]))
      .map(timeKey =>
        new Issue(registry.DATA_POINT_UNEXPECTED_TIME_VALUE)
          .setPath(dataPointFileDescriptor.dataPointDetail.fullPath)
          .setData({
            concept: timeKey,
            line: dataPointFileDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
            value: dataPointFileDescriptor.dataPointRecord[timeKey]
          }))
};
