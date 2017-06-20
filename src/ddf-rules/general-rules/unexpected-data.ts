import { UNEXPECTED_DATA } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => ddfDataSet.ddfRoot.fileDescriptors
    .filter(fileDescriptor => !fileDescriptor.csvChecker.isCorrect() && fileDescriptor.type)
    .map(fileDescriptor => new Issue(UNEXPECTED_DATA)
      .setPath(fileDescriptor.fullPath)
      .setData(fileDescriptor.csvChecker.errors))
};
