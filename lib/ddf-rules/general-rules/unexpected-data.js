'use strict';

const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => {
    const result = [];

    ddfDataSet.ddfRoot.directoryDescriptors.forEach(directoryDescriptor => {
      if (!directoryDescriptor.ddfIndex.csvChecker.isCorrect()) {
        result.push(
          new Issue(registry.UNEXPECTED_DATA)
            .setPath(directoryDescriptor.ddfIndex.indexPath)
            .setData(directoryDescriptor.ddfIndex.csvChecker.errors)
        );
      }

      directoryDescriptor.fileDescriptors.forEach(fileDescriptor => {
        if (!fileDescriptor.csvChecker.isCorrect() && fileDescriptor.type) {
          result.push(
            new Issue(registry.UNEXPECTED_DATA)
              .setPath(fileDescriptor.fullPath)
              .setData(fileDescriptor.csvChecker.errors)
          );
        }
      });
    });

    return result;
  }
};
