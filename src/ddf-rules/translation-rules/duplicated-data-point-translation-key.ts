import {uniq, isEmpty} from 'lodash';
import {DUPLICATED_DATA_POINT_TRANSLATION_KEY} from '../registry';
import {Issue} from '../issue';

const md5 = require('md5');

let storage = {};

export const rule = {
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
    const duplicates = uniq(storage[ruleKey].duplicatedPrimaryKeys);

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DUPLICATED_DATA_POINT_TRANSLATION_KEY)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData(duplicates);

      storage[ruleKey] = null;
    }

    return issue;
  }
};
