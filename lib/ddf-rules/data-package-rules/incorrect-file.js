'use strict';

const _ = require('lodash');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => _.compact(_.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors
      .map(directoryDescriptor =>
        directoryDescriptor.fileDescriptors
          .filter(fileDescriptor => !_.isEmpty(fileDescriptor.issues))
          .map(fileDescriptor =>
            fileDescriptor.issues
              .map(issue =>
                new Issue(issue.type)
                  .setPath(issue.path)
                  .setData(issue.data))))
  ))
};
