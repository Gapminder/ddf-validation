import {NON_DDF_FOLDER} from '../registry';
import {getNonDdfDirectoryDescriptors} from './shared';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => getNonDdfDirectoryDescriptors(ddfDataSet)
    .map(directoryDescriptor => new Issue(NON_DDF_FOLDER)
      .setPath(directoryDescriptor.dir))
};
