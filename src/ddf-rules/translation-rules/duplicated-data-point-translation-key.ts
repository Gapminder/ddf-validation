import { uniq, isEmpty } from 'lodash';
import { DUPLICATED_DATA_POINT_TRANSLATION_KEY } from '../registry';
import { Issue } from '../issue';

const md5 = require('md5');

let storage: Map<string, any> = new Map();

export const rule = {
  resetStorage: () => {
    storage.clear();
  },
  isTranslation: true,
  aggregateRecord: (dataPointDescriptor, ruleKey) => {
    const ruleKeyString = Symbol.keyFor(ruleKey);

    if (!storage.has(ruleKeyString)) {
      storage.set(ruleKeyString, {
        hash: new Set(),
        duplicatedPrimaryKeys: []
      });
    }

    const keyData = dataPointDescriptor.fileDescriptor.primaryKey
      .map(keyPart => dataPointDescriptor.record[keyPart])
      .join(',');
    const recordHash = md5(keyData);

    if (storage.get(ruleKeyString).hash.has(recordHash)) {
      storage.get(ruleKeyString).duplicatedPrimaryKeys.push(keyData);
    }

    storage.get(ruleKeyString).hash.add(recordHash);
  },
  aggregativeRule: (dataPointDescriptor, ruleKey) => {
    const ruleKeyString = Symbol.keyFor(ruleKey);
    const duplicates = uniq(storage.get(ruleKeyString).duplicatedPrimaryKeys);

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DUPLICATED_DATA_POINT_TRANSLATION_KEY)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData(duplicates);
    }

    storage.delete(ruleKeyString);

    return issue;
  }
};
