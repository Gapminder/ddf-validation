'use strict';

const _ = require('lodash');
const registry = require('./registry');
const Issue = require('./issue');

module.exports = {
  [registry.INCORRECT_FILE]: ddfDataSet => _.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors
      .filter(directoryDescriptor => directoryDescriptor.isDDF)
      .map(
        directoryDescriptor => (directoryDescriptor.ddfIndex.issues || [])
          .filter(issue => issue && issue.type === registry.INCORRECT_FILE)
          .map(issue => new Issue(issue.type).fillPath(issue.path).fillData(issue.data))
      )
  ),
  [registry.INDEX_IS_NOT_FOUND]: ddfDataSet => ddfDataSet.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => directoryDescriptor.isDDF && !!directoryDescriptor.ddfIndex.error)
    .map(directoryDescriptor => new Issue(registry.INDEX_IS_NOT_FOUND)
      .fillPath(directoryDescriptor.dir).warning())
};
