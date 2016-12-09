import {compact, flattenDeep, filter, includes, isEmpty} from 'lodash';
import {DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor => {
      const names = directoryDescriptor.dataPackage.getResources().map(resource => resource.name);
      const duplicates = filter(names, (value, index, iteratee) => includes(iteratee, value, index + 1));

      let issue = null;

      if (!isEmpty(duplicates)) {
        issue = new Issue(DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME)
          .setPath(directoryDescriptor.dir)
          .setData({duplicates});
      }

      return issue;
    })
  ))
};
