'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => _.compact(_.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor => {
      const names = _.map(directoryDescriptor.dataPackage.getResources(), 'name');
      const duplicates = _.filter(names, (value, index, iteratee) => _.includes(iteratee, value, index + 1));

      let issue = null;

      if (!_.isEmpty(duplicates)) {
        issue = new Issue(registry.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME)
          .setPath(directoryDescriptor.dir)
          .setData({duplicates});
      }

      return issue;
    })
  ))
};
