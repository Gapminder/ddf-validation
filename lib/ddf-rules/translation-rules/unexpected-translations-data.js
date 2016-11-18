'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  isTranslation: true,
  rule: ddfDataSet => {
    const getDataConsistencyIssues =
      (primaryKey, transFileDescriptor) => transFileDescriptor.content
        .filter(transRecord => !transRecord[primaryKey])
        .map(transRecord => ({transRecord, primaryKey, transFileDescriptor}));
    const fileDescriptorsToCheck =
      _.concat(ddfDataSet.getConcept().fileDescriptors, ddfDataSet.getEntity().fileDescriptors);
    const dataConsistencyIssuesSources =
      _.compact(_.flattenDeep(
        fileDescriptorsToCheck.map(fileDescriptor =>
          fileDescriptor.transFileDescriptors
            .map(transFileDescriptor =>
              getDataConsistencyIssues(fileDescriptor.primaryKey, transFileDescriptor)
            )
            .filter(issueSource => !!issueSource)
        )
      ));

    return dataConsistencyIssuesSources.map(issueSource =>
      new Issue(registry.UNEXPECTED_TRANSLATIONS_DATA)
        .setPath(issueSource.transFileDescriptor.fullPath)
        .setData({
          record: issueSource.transRecord,
          primaryKey: issueSource.primaryKey
        })
    );
  }
};
