'use strict';

const _ = require('lodash');
const registry = require('./registry');
const Issue = require('./issue');

module.exports = {
  [registry.INCORRECT_FILE]: ddfData =>
    _.flattenDeep(
      ddfData.ddfRoot.directoryDescriptors
        .map(
          directoryDescriptor => (directoryDescriptor.ddfIndex.issues || [])
            .filter(issue => issue && issue.type === registry.INCORRECT_FILE)
            .map(issue => new Issue(issue.type, issue.path, issue.data))
        )
    ),
  [registry.INDEX_IS_NOT_FOUND]: ddfData => ddfData.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => !!directoryDescriptor.ddfIndex.error === true)
    .map(directoryDescriptor => new Issue(
      registry.INDEX_IS_NOT_FOUND,
      directoryDescriptor.dir,
      directoryDescriptor.dir).warning())
};
