'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

function getAsArray(value) {
  return _.isArray(value) ? value : [value];
}

module.exports = {
  rule: ddfDataSet => _.compact(_.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.fileDescriptors.map(fileDescriptor =>
        fileDescriptor.getExistingTranslationDescriptors()
          .map(translationDescriptor => {
            const headersDiff = _.intersection(fileDescriptor.headers, translationDescriptor.headers);
            const primaryKey = getAsArray(fileDescriptor.primaryKey);
            const primaryKeyDiff = _.intersection(primaryKey, translationDescriptor.headers);
            const issues = [];
            const pushIssue = issueData => {
              issues.push(new Issue(registry.UNEXPECTED_TRANSLATION_HEADER)
                .setPath(translationDescriptor.fullPath)
                .setData(issueData));
            };

            if (translationDescriptor.headers.length > headersDiff.length || headersDiff.length === 0) {
              pushIssue({
                reason: 'extra data in translation',
                ddfFileHeaders: fileDescriptor.headers,
                translationHeaders: translationDescriptor.headers
              });
            }

            if (primaryKeyDiff.length < primaryKey.length) {
              pushIssue({
                reason: 'non consistent primary key',
                primaryKey: fileDescriptor.primaryKey,
                translationHeaders: translationDescriptor.headers
              });
            }

            return issues;
          })
      )
    )
  ))
};
