'use strict';

const registry = require('../registry');
const shared = require('./shared');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => shared.getNonDdfDirectoryDescriptors(ddfDataSet)
    .map(directoryDescriptor => new Issue(registry.NON_DDF_FOLDER)
      .setPath(directoryDescriptor.dir))
};
