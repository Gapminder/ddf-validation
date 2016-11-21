'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');
const constants = require('../../ddf-definitions/constants');
const shared = require('./shared');

module.exports = {
  recordRule: dataPointDescriptor => {
    const entityValueHash = shared.cacheFor.entityValueHash(dataPointDescriptor);

    return Object.keys(entityValueHash)
      .filter(entityKey =>
        !_.includes(entityValueHash[entityKey], dataPointDescriptor.record[entityKey]))
      .map(entityKey =>
        new Issue(registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE)
          .setPath(dataPointDescriptor.fileDescriptor.fullPath)
          .setData({
            concept: entityKey,
            line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
            value: dataPointDescriptor.record[entityKey]
          }));
  }
};
