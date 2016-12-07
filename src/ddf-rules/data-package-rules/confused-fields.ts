import {compact, flattenDeep, head, difference, isEmpty} from 'lodash';
import {DATAPACKAGE_CONFUSED_FIELDS} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.dataPackage.getResources().map(resource => {
        const dataPackageHeaders = resource.schema.fields.map(field => field.name);
        const relatedFileDescriptor = head(
          directoryDescriptor.dataPackage.fileDescriptors
            .filter(fileDescriptor => fileDescriptor.filename === resource.path)
        );
        const realHeaders = relatedFileDescriptor.headers;
        const headersDifference = difference(dataPackageHeaders, realHeaders);

        let issue = null;

        if (!isEmpty(headersDifference)) {
          issue = new Issue(DATAPACKAGE_CONFUSED_FIELDS)
            .setPath(relatedFileDescriptor.fullPath)
            .setData({dataPackageHeaders, realHeaders, headersDifference});
        }

        return issue;
      })
    )
  ))
};
