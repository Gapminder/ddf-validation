import { difference, uniq, isEmpty } from 'lodash';
import { DUPLICATED_DATA_POINT_TRANSLATION_KEY } from '../registry';
import { Issue } from '../issue';

let storage: any;

const initStorage = () => {
  if (storage && storage.hash) {
    storage.hash.clear();
  }

  storage = {
    hash: new Set(),
    duplicatedPrimaryKeys: []
  };
};

initStorage();

export const rule = {
  resetStorage: () => {
    initStorage();
  },
  isTranslation: true,
  aggregateRecord: (dataPointDescriptor) => {
    const sortedPrimaryKey = dataPointDescriptor.fileDescriptor.primaryKey.sort();
    const dimensionData = sortedPrimaryKey.map(keyPart => `${keyPart}:${dataPointDescriptor.record[keyPart]}`).join(',');
    const indicatorName = difference(dataPointDescriptor.fileDescriptor.headers, dataPointDescriptor.fileDescriptor.primaryKey).join(',');
    const recordHash = `${dimensionData}@${indicatorName}`;

    if (storage.hash.has(recordHash)) {
      storage.duplicatedPrimaryKeys.push(recordHash);
    }

    storage.hash.add(recordHash);
  },
  aggregativeRule: (dataPointDescriptor) => {
    const duplicates = uniq(storage.duplicatedPrimaryKeys);

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DUPLICATED_DATA_POINT_TRANSLATION_KEY)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData(duplicates);
    }

    initStorage();

    return issue;
  }
};
