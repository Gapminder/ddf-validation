'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

function getAsArray(value) {
  return _.isArray(value) ? value : [value];
}

module.exports = {
  rule: ddfDataSet => _.compact(_.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors
      .map(directoryDescriptor =>
        directoryDescriptor.fileDescriptors
          .map(fileDescriptor =>
            fileDescriptor.getExistingTranslationDescriptors()
              .map(transDesc => {
                const headersDiff = _.intersection(fileDescriptor.headers, transDesc.headers);
                const primaryKey = getAsArray(fileDescriptor.primaryKey);
                const primaryKeyDiff = _.intersection(primaryKey, transDesc.headers);
                const issues = [];

                if (transDesc.headers.length > headersDiff.length || headersDiff.length === 0) {
                  issues.push(new Issue(registry.UNEXPECTED_TRANSLATION_HEADER)
                    .setPath(transDesc.fullPath)
                    .setData({
                      reason: 'extra data in translation',
                      ddfFileHeaders: fileDescriptor.headers,
                      translationHeaders: transDesc.headers
                    }));
                }

                if (primaryKeyDiff.length < primaryKey.length) {
                  issues.push(new Issue(registry.UNEXPECTED_TRANSLATION_HEADER)
                    .setPath(transDesc.fullPath)
                    .setData({
                      reason: 'non consistent primary key',
                      primaryKey: fileDescriptor.primaryKey,
                      translationHeaders: transDesc.headers
                    }));
                }

                return issues;
              })
          )
      )
  ))
};
