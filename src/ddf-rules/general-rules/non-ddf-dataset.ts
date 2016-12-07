import {NON_DDF_DATA_SET} from '../registry';
import {getNonDdfDirectoryDescriptors} from './shared';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const result = [];
    const nonDdfDirectoryDescriptors = getNonDdfDirectoryDescriptors(ddfDataSet);

    if (nonDdfDirectoryDescriptors.length === ddfDataSet.ddfRoot.directoryDescriptors.length) {
      const issue = new Issue(NON_DDF_DATA_SET)
        .setPath(ddfDataSet.ddfRoot.path);

      result.push(issue);
    }

    return result;
  }
};
