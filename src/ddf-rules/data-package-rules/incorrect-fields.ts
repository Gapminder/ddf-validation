import { compact, flattenDeep, head, difference, isEmpty, endsWith } from 'lodash';
import { DATAPACKAGE_INCORRECT_FIELDS } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const ddfRoot = ddfDataSet.ddfRoot;

    return compact(flattenDeep(
      ddfRoot.getDataPackageResources().map(resource => {
        const dataPackageHeaders = resource.schema.fields.map(field => field.name);
        const relatedFileDescriptor = head(
          ddfRoot.dataPackageDescriptor.fileDescriptors.filter(fileDescriptor =>
            endsWith(resource.path, fileDescriptor.filename))
        );
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
