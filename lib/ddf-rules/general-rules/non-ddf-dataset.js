'use strict';

const registry = require('../registry');
const shared = require('./shared');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => {
    const result = [];
    const nonDdfDirectoryDescriptors = shared.getNonDdfDirectoryDescriptors(ddfDataSet);

    if (nonDdfDirectoryDescriptors.length === ddfDataSet.ddfRoot.directoryDescriptors.length) {
      const issue = new Issue(registry.NON_DDF_DATA_SET)
        .setPath(ddfDataSet.ddfRoot.path);

      result.push(issue);
    }

    return result;
  }
};
