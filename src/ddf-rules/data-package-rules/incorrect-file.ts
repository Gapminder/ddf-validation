import {compact, flattenDeep, isEmpty} from 'lodash';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet): Array<Issue> => {
    const result: Array<any> = ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.fileDescriptors
        .filter(fileDescriptor => !isEmpty(fileDescriptor.issues))
        .map(fileDescriptor => fileDescriptor.issues.map(issue =>
          new Issue(issue.type).setPath(issue.path).setData(issue.data))));

    return compact(flattenDeep(result));
  }
};
