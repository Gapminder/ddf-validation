'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => _.compact(_.flatten(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.fileDescriptors
        .filter(fileDescriptor => !fileDescriptor.csvChecker.isCorrect() && fileDescriptor.type)
        .map(fileDescriptor => new Issue(registry.UNEXPECTED_DATA)
          .setPath(fileDescriptor.fullPath)
          .setData(fileDescriptor.csvChecker.errors)
        )
    )
  ))
};
