'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet => {
    const concept = ddfDataSet.getConcept();
    const paths = concept.fileDescriptors.map(fileDescriptor => fileDescriptor.fullPath);
    let result = null;

    const conceptsIds = concept
      .getAllData()
      .map(conceptRecord => conceptRecord.concept);
    const nonUniqueConceptIds = _.transform(
      _.countBy(conceptsIds), (_result, count, value) => {
        if (count > 1) {
          _result.push(value);
        }
      },
      []
    );

    if (!_.isEmpty(nonUniqueConceptIds)) {
      result = new Issue(registry.CONCEPT_ID_IS_NOT_UNIQUE)
        .setPath(paths)
        .setData(nonUniqueConceptIds);
    }

    return result;
  }
};