import { UNEXPECTED_DATA } from '../registry';
import { CONCEPT, ENTITY, DATA_POINT } from '../../ddf-definitions/constants';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => ddfDataSet.ddfRoot.fileDescriptors
    .filter(fileDescriptor => !fileDescriptor.hasFirstLine)
    .filter(fileDescriptor =>
      fileDescriptor.type === CONCEPT ||
      fileDescriptor.type === ENTITY ||
      fileDescriptor.type === DATA_POINT)
    .map(fileDescriptor => new Issue(UNEXPECTED_DATA).setPath(fileDescriptor.fullPath))
};
