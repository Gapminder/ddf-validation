'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => _.compact(_.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.dataPackage.getResources().map(resource => {
        const dataPackageHeaders = resource.schema.fields.map(field => field.name);
        const relatedFileDescriptor = _.head(
          directoryDescriptor.dataPackage.fileDescriptors
            .filter(fileDescriptor => fileDescriptor.filename === resource.path)
        );
        const realHeaders = relatedFileDescriptor.headers;
        const headersDifference = _.difference(dataPackageHeaders, realHeaders);

        let issue = null;

        if (!_.isEmpty(headersDifference)) {
          issue = new Issue(registry.DATAPACKAGE_CONFUSED_FIELDS)
            .setPath(relatedFileDescriptor.fullPath)
            .setData({dataPackageHeaders, realHeaders, headersDifference});
        }

        return issue;
      })
    )
  ))
};
