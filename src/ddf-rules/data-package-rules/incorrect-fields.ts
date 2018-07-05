import * as path from 'path';
import { compact, flattenDeep, difference, isEmpty, head } from 'lodash';
import { DATAPACKAGE_INCORRECT_FIELDS } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    return compact(flattenDeep(
      ddfDataSet.getDataPackageResources().map(resource => {
        const dataPackageHeaders = resource.schema.fields.map(field => field.name);
        const relatedFileDescriptor = head(ddfDataSet.dataPackageDescriptor.fileDescriptors.filter(fileDescriptor =>
          fileDescriptor.fullPath === path.resolve(fileDescriptor.rootFolder, resource.path)));

        if (!relatedFileDescriptor) {
          return null;
        }

        const realHeaders = relatedFileDescriptor.headers;
        const headersDifference = difference(dataPackageHeaders, realHeaders);

        let issue = null;

        if (!isEmpty(headersDifference)) {
          issue = new Issue(DATAPACKAGE_INCORRECT_FIELDS)
            .setPath(relatedFileDescriptor.fullPath)
            .setData({dataPackageHeaders, realHeaders, headersDifference});
        }

        return issue;
      })
    ));
  }
};
