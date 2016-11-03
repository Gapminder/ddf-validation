'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');
const constants = require('../../ddf-definitions/constants');
const shared = require('./shared');

module.exports = {
  rule: dataPointFileDescriptor => {
    const entityValueHash = shared.cacheFor.entityValueHash(dataPointFileDescriptor);

    return Object.keys(entityValueHash)
      .filter(entityKey =>
        !_.includes(entityValueHash[entityKey], dataPointFileDescriptor.dataPointRecord[entityKey]))
      .map(entityKey =>
        new Issue(registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE)
          .setPath(dataPointFileDescriptor.dataPointDetail.fullPath)
          .setData({
            concept: entityKey,
            line: dataPointFileDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
            value: dataPointFileDescriptor.dataPointRecord[entityKey]
          }));
  }
};
