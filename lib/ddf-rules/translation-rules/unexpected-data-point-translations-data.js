'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  rule: dataPointDescriptor => {
    const emptyDataUnderPrimaryKey =
      dataPointDescriptor.dataPointFileTransDescriptor.primaryKey
        .filter(primaryKeyPart => !dataPointDescriptor.transRecord[primaryKeyPart]);

    if (!_.isEmpty(emptyDataUnderPrimaryKey)) {
      return new Issue(registry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA)
        .setPath(dataPointDescriptor.dataPointFileTransDescriptor.fullPath)
        .setData({
          record: dataPointDescriptor.transRecord,
          primaryKey: dataPointDescriptor.dataPointFileTransDescriptor.primaryKey
        });
    }

    return null;
  }
};
