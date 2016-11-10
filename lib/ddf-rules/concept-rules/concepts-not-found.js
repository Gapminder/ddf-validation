'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

function getConceptsNotFoundIssue(ddfDataSet) {
  const concepts = ddfDataSet.getConcept().getAllData();

  if (_.isEmpty(concepts)) {
    return new Issue(registry.CONCEPTS_NOT_FOUND);
  }

  return null;
}

module.exports = {rule: ddfDataSet => getConceptsNotFoundIssue(ddfDataSet)};
