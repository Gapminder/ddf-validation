import { compact, filter, includes, isEmpty } from 'lodash';
import { DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const names = ddfDataSet.getDataPackageResources().map(resource => resource.name);
    const duplicates = filter(names, (value, index, iteratee) => includes(iteratee, value, index + 1));

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME)
        .setPath(ddfDataSet.ddfRoot.path)
        .setData({duplicates});
    }

    return compact([issue]);
  }
};
