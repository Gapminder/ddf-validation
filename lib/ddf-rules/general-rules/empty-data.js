'use strict';

const _ = require('lodash');
const registry = require('../registry');
const constants = require('../../ddf-definitions/constants');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => _.flatten(
    ddfDataSet.ddfRoot.directoryDescriptors
      .map(directoryDescriptor =>
        directoryDescriptor.fileDescriptors
          .filter(fileDescriptor => !fileDescriptor.hasFirstLine)
          .filter(fileDescriptor =>
          fileDescriptor.type === constants.CONCEPT ||
          fileDescriptor.type === constants.ENTITY ||
          fileDescriptor.type === constants.DATA_POINT)
          .map(fileDescriptor =>
            new Issue(registry.UNEXPECTED_DATA)
              .setPath(fileDescriptor.fullPath))
      )
  )
};
