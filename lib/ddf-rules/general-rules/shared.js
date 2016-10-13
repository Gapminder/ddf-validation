'use strict';

module.exports = {
  getNonDdfDirectoryDescriptors: ddfData => ddfData.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => !directoryDescriptor.isDDF)
};
