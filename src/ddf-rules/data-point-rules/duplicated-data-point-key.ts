import { uniq, isEmpty, difference } from 'lodash';
import { DUPLICATED_DATA_POINT_KEY } from '../registry';
import { Issue } from '../issue';

let storage: any;

const initStorage = () => {
  if (storage && storage.hash) {
    storage.hash.clear();
  }

  storage = {
    hash: new Set(),
    duplicatedHashes: [],
    content: {}
  };
};

initStorage();

export const rule = {
  resetStorage: () => {
    initStorage();
  },
  aggregateRecord: (dataPointDescriptor) => {
    const sortedPrimaryKey = dataPointDescriptor.fileDescriptor.primaryKey.sort();
    const dimensionData = sortedPrimaryKey.map(keyPart => `${keyPart}:${dataPointDescriptor.record[keyPart]}`).join(',');
    const indicatorName = difference(dataPointDescriptor.fileDescriptor.headers, dataPointDescriptor.fileDescriptor.primaryKey).join(',');
    const recordHash = `${dimensionData}@${indicatorName}`;

    if (storage.hash.has(recordHash)) {
      storage.duplicatedHashes.push(recordHash);
    }

    storage.hash.add(recordHash);

    if (!storage.content[recordHash]) {
      storage.content[recordHash] = [];
    }

    storage.content[recordHash].push({
      file: dataPointDescriptor.fileDescriptor.file,
      record: dataPointDescriptor.record,
      line: dataPointDescriptor.line
    });
  },
  aggregativeRule: (dataPointDescriptor) => {
    const duplicates: string[] = <string[]>uniq(storage.duplicatedHashes);
    const data: any[] = [];

    for (const hash of duplicates) {
      data.push(storage.content[hash]);
    }

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DUPLICATED_DATA_POINT_KEY).setPath(dataPointDescriptor.fileDescriptor.fullPath).setData(data);
    }

    initStorage();

    return issue;
  }
};
