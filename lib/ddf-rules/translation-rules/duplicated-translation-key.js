'use strict';

const _ = require('lodash');
const registry = require('../registry');
const constants = require('../../ddf-definitions/constants');
const Issue = require('../issue');

/* eslint-disable arrow-body-style */

module.exports = {
  isTranslation: true,
  rule: ddfDataSet => _.compact(_.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor => {
      return directoryDescriptor.fileDescriptors.map(fileDescriptor => {
        return fileDescriptor.getExistingTranslationDescriptors()
          .filter(translationDescriptor => translationDescriptor.type !== constants.DATA_POINT)
          .map(translationDescriptor => {
            const primaryKeys = translationDescriptor.content.map(record =>
              record[translationDescriptor.primaryKey]);
            const duplications = _.filter(primaryKeys, (value, index, iteratee) =>
              _.includes(iteratee, value, index + 1));

            let issue = null;

            if (!_.isEmpty(duplications)) {
              issue = new Issue(registry.DUPLICATED_TRANSLATION_KEY)
                .setPath(translationDescriptor.fullPath)
                .setData(duplications);
            }

            return issue;
          });
      });
    })
  ))
};
