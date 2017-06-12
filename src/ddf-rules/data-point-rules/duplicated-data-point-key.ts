import { uniq, isEmpty, difference } from 'lodash';
import { DUPLICATED_DATA_POINT_KEY } from '../registry';
import { Issue } from '../issue';

const md5 = require('md5');

let storage: Map<string, any> = new Map();

const initRuleInStorage = (ruleKey: string) => {
  if (!storage.has(ruleKey)) {
    storage.set(ruleKey, {
      hash: new Set(),
      duplicatedHashes: [],
      content: {}
    });
  }
};

export const rule = {
  resetStorage: () => {
    storage.clear();
  },
  aggregateRecord: (dataPointDescriptor, ruleKey) => {
    const ruleKeyString = Symbol.keyFor(ruleKey);

    initRuleInStorage(ruleKeyString);

    const keyData = dataPointDescriptor.fileDescriptor.primaryKey.map(keyPart => dataPointDescriptor.record[keyPart]).join(',');
    const indicatorKey = difference(dataPointDescriptor.fileDescriptor.headers, dataPointDescriptor.fileDescriptor.primaryKey).join(',');
    const recordHash = `${keyData}@${indicatorKey}`;

    if (storage.get(ruleKeyString).hash.has(recordHash)) {
      storage.get(ruleKeyString).duplicatedHashes.push(recordHash);
    }

    storage.get(ruleKeyString).hash.add(recordHash);

    if (!storage.get(ruleKeyString).content[recordHash]) {
      storage.get(ruleKeyString).content[recordHash] = [];
    }

    storage.get(ruleKeyString).content[recordHash].push({
      record: dataPointDescriptor.record,
      line: dataPointDescriptor.line
    });
  },
  aggregativeRule: (dataPointDescriptor, ruleKey) => {
    const ruleKeyString = Symbol.keyFor(ruleKey);

    initRuleInStorage(ruleKeyString);

    const duplicates: string[] = <string[]>uniq(storage.get(ruleKeyString).duplicatedHashes);
    const data: any[] = [];

    for (const hash of duplicates) {
      data.push(storage.get(ruleKeyString).content[hash]);
    }

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DUPLICATED_DATA_POINT_KEY).setPath(dataPointDescriptor.fileDescriptor.fullPath).setData(data);
    }

    storage.delete(ruleKeyString);

    return issue;
  }
};
