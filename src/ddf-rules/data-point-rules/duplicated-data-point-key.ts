import { uniq, isEmpty, difference } from 'lodash';
import { DUPLICATED_DATA_POINT_KEY } from '../registry';
import { Issue } from '../issue';

const md5 = require('md5');

let storage: any = {};

const initRuleInStorage = (ruleKey: symbol) => {
  if (!storage[ruleKey]) {
    storage[ruleKey] = {
      hash: new Set(),
      duplicatedHashes: [],
      content: {}
    };
  }
};

export const rule = {
  resetStorage: () => {
    storage = {};
  },
  aggregateRecord: (dataPointDescriptor, ruleKey) => {
    initRuleInStorage(ruleKey);

    const keyData = dataPointDescriptor.fileDescriptor.primaryKey.map(keyPart => dataPointDescriptor.record[keyPart]).join(',');
    const indicatorKey = difference(dataPointDescriptor.fileDescriptor.headers, dataPointDescriptor.fileDescriptor.primaryKey).join(',');
    const recordHash = `${keyData}@${indicatorKey}`;

    if (storage[ruleKey].hash.has(recordHash)) {
      storage[ruleKey].duplicatedHashes.push(recordHash);
    }

    storage[ruleKey].hash.add(recordHash);

    if (!storage[ruleKey].content[recordHash]) {
      storage[ruleKey].content[recordHash] = [];
    }

    storage[ruleKey].content[recordHash].push({record: dataPointDescriptor.record, line: dataPointDescriptor.line});
  },
  aggregativeRule: (dataPointDescriptor, ruleKey) => {
    initRuleInStorage(ruleKey);

    const duplicates: string[] = <string[]>uniq(storage[ruleKey].duplicatedHashes);
    const data: any[] = [];

    for (const hash of duplicates) {
      data.push(storage[ruleKey].content[hash]);
    }

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DUPLICATED_DATA_POINT_KEY).setPath(dataPointDescriptor.fileDescriptor.fullPath).setData(data);
      storage[ruleKey] = null;
    }

    return issue;
  }
};
