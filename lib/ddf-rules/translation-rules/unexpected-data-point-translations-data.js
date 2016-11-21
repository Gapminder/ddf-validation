'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  isTranslation: true,
  recordRule: dataPointDescriptor => {
    const emptyDataUnderPrimaryKey = dataPointDescriptor.fileDescriptor.primaryKey.filter(primaryKeyPart =>
      !dataPointDescriptor.record[primaryKeyPart]);

    if (!_.isEmpty(emptyDataUnderPrimaryKey)) {
      return new Issue(registry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData({
          record: dataPointDescriptor.record,
          primaryKey: dataPointDescriptor.fileDescriptor.primaryKey
        });
    }

    return null;
  }
};
