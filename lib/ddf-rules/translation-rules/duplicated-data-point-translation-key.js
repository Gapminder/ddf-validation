'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');
const md5 = require('md5');

let storage = {};

module.exports = {
  resetStorage: () => {
    storage = {};
  },
  isTranslation: true,
  aggregateRecord: (dataPointDescriptor, ruleKey) => {
    if (!storage[ruleKey]) {
      storage[ruleKey] = {
        hash: new Set(),
        duplicatedPrimaryKeys: []
      };
    }

    const keyData = dataPointDescriptor.fileDescriptor.primaryKey
      .map(keyPart => dataPointDescriptor.record[keyPart])
      .join(',');
    const recordHash = md5(keyData);

    if (storage[ruleKey].hash.has(recordHash)) {
      storage[ruleKey].duplicatedPrimaryKeys.push(keyData);
    }

    storage[ruleKey].hash.add(recordHash);
  },
  aggregativeRule: (dataPointDescriptor, ruleKey) => {
    const duplicates = _.uniq(storage[ruleKey].duplicatedPrimaryKeys);

    let issue = null;

    if (!_.isEmpty(duplicates)) {
      issue = new Issue(registry.DUPLICATED_DATA_POINT_TRANSLATION_KEY)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData(duplicates);

      storage[ruleKey] = null;
    }

    return issue;
  }
};
