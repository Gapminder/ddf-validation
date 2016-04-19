'use strict';

const registry = require('./registry');
const Issue = require('./issue');

function getNonDdfDirectoryDescriptors(ddfData) {
  return ddfData.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => !directoryDescriptor.isDDF);
}

module.exports = {
  [registry.NON_DDF_DATA_SET]: ddfDataSet => {
    const result = [];
    const nonDdfDirectoryDescriptors = getNonDdfDirectoryDescriptors(ddfDataSet);

    if (nonDdfDirectoryDescriptors.length === ddfDataSet.ddfRoot.directoryDescriptors.length) {
      const issue = new Issue(registry.NON_DDF_DATA_SET)
        .fillPath(ddfDataSet.ddfRoot.path);

      result.push(issue);
    }

    return result;
  },
  [registry.NON_DDF_FOLDER]: ddfDataSet => getNonDdfDirectoryDescriptors(ddfDataSet)
    .map(directoryDescriptor => new Issue(registry.NON_DDF_FOLDER)
      .fillPath(directoryDescriptor.dir)
      .warning())
};
