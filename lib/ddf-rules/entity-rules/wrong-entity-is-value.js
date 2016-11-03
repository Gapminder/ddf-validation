'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');
const constants = require('../../ddf-definitions/constants');
const IS_HEADER_PREFIX = 'is--';

module.exports = {
  rule: ddfDataSet => {
    const result = [];
    const entities = ddfDataSet.getEntity().getDataByFiles();
    const entityFiles = _.keys(entities);
    const VALUE_TEMPLATE = ['true', 'false', 'TRUE', 'FALSE'];

    entityFiles.forEach(entityFile => {
      if (!_.isEmpty(entities[entityFile])) {
        const expectedKeys = _.keys(_.head(entities[entityFile]))
          .filter(entityRecordKey =>
            _.startsWith(entityRecordKey, IS_HEADER_PREFIX));

        entities[entityFile].forEach(entityRecord => {
          expectedKeys.forEach(key => {
            if (!_.includes(VALUE_TEMPLATE, entityRecord[key])) {
              const data = {
                header: key,
                line: entityRecord.$$lineNumber + constants.LINE_NUM_INCLUDING_HEADER,
                value: entityRecord[key]
              };
              const issue = new Issue(registry.WRONG_ENTITY_IS_VALUE)
                .setPath(entityFile)
                .setData(data);

              result.push(issue);
            }
          });
        });
      }
    });

    return result;
  }
};
