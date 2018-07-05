import { compact, filter, includes, isEmpty } from 'lodash';
import { DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const files = ddfDataSet.getDataPackageResources().map(resource => resource.path);
    const duplicates = filter(files, (value, index, iteratee) => includes(iteratee, value, index + 1));

    let issue = null;

    if (!isEmpty(duplicates)) {
      issue = new Issue(DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE)
        .setPath(ddfDataSet.rootPath)
        .setData({duplicates});
    }

    return compact([issue]);
  }
};
