import { NON_DDF_DATA_SET } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const result = [];

    if (!ddfDataSet.ddfRoot.isDDF) {
      const issue = new Issue(NON_DDF_DATA_SET)
        .setPath(ddfDataSet.ddfRoot.path);

      result.push(issue);
    }

    return result;
  }
};
