'use strict';

const registry = require('./registry');
const Issue = require('./issue');

function getNonDdfDirectoryDescriptors(ddfData) {
  return ddfData.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => !directoryDescriptor.isDDF);
}

module.exports = {
  [registry.NON_DDF_DATA_SET]: ddfData => {
    const result = [];
    const nonDdfDirectoryDescriptors = getNonDdfDirectoryDescriptors(ddfData);

    if (nonDdfDirectoryDescriptors.length === ddfData.ddfRoot.directoryDescriptors.length) {
      const issue = new Issue(registry.NON_DDF_DATA_SET)
        .fillPath(ddfData.ddfRoot.path);

      result.push(issue);
    }

    return result;
  },
  [registry.NON_DDF_FOLDER]: ddfData => getNonDdfDirectoryDescriptors(ddfData)
    .map(directoryDescriptor => new Issue(registry.NON_DDF_FOLDER)
      .fillPath(directoryDescriptor.dir)
      .warning())
};
