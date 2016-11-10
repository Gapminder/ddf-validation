'use strict';

const _ = require('lodash');
const path = require('path');
const registry = require('../registry');
const Issue = require('../issue');
const constants = require('../../ddf-definitions/constants');

function getArrayInAnyCase(value) {
  if (!_.isArray(value)) {
    return [value];
  }

  return value;
}

module.exports = {
  rule: ddfDataSet => _.compact(_.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors
      .map(directoryDescriptor =>
        directoryDescriptor.dataPackage.getResources()
          .map(resource => {
            const dataPackagePrimaryKey = getArrayInAnyCase(resource.schema.primaryKey);
            const allConceptsIds = ddfDataSet.getConcept()
              .getIds()
              .concat(constants.PREDEFINED_CONCEPTS);
            const nonConcepts =
              dataPackagePrimaryKey
                .filter(header => !_.includes(allConceptsIds, header));

            let issue = null;

            if (!_.isEmpty(nonConcepts)) {
              issue = new Issue(registry.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY)
                .setPath(path.resolve(directoryDescriptor.dir, resource.path))
                .setData({nonConcepts});
            }

            return issue;
          })
      )
  ))
};
