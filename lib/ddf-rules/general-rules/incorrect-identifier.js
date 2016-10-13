'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');
const NOT_ALPHANUMERIC = /[^a-z0-9_]/;

function getIdentifierColumnsNames(ddfDataSet, firstRecord) {
  const concept = ddfDataSet.getConcept();
  const relatedConceptNames = concept.getDataIdsByType('entity_set')
    .concat(concept.getDataIdsByType('entity_domain'));

  return _.keys(firstRecord)
    .filter(entityHeader => _.includes(relatedConceptNames, entityHeader));
}

function getIncorrectConceptIdentifierIssues(ddfDataSet) {
  return ddfDataSet.getConcept()
    .getAllData()
    .filter(conceptRecord => conceptRecord.concept)
    .filter(conceptRecord => NOT_ALPHANUMERIC.test(conceptRecord.concept))
    .map(conceptRecord =>
      new Issue(registry.INCORRECT_IDENTIFIER)
        .setPath(conceptRecord.$$source)
        .setData([{
          conceptValue: conceptRecord.concept,
          line: conceptRecord.$$lineNumber
        }]));
}

function getIncorrectEntityIdentifierIssues(ddfDataSet) {
  const entitiesByFile = ddfDataSet.getEntity().getDataByFiles();

  function getIssueData(entityFileName, entitiesConcepts) {
    return entitiesByFile[entityFileName]
      .map(entityRecord => entitiesConcepts
        .filter(entityConcept => !!entityRecord[entityConcept])
        .filter(entityConcept => NOT_ALPHANUMERIC.test(entityRecord[entityConcept]))
        .map(entityConcept => ({
          conceptName: entityConcept,
          conceptValue: entityRecord[entityConcept],
          line: entityRecord.$$lineNumber
        })));
  }

  function getIssueByEntityFile(entityFileName) {
    const entitiesConcepts = getIdentifierColumnsNames(ddfDataSet, _.head(entitiesByFile[entityFileName]));
    const issueData = _.compact(_.flattenDeep(getIssueData(entityFileName, entitiesConcepts)));

    if (!_.isEmpty(issueData)) {
      return new Issue(registry.INCORRECT_IDENTIFIER)
        .setPath(entityFileName)
        .setData(issueData);
    }

    return null;
  }

  const issues = _.keys(entitiesByFile)
    .map(entityFileName => getIssueByEntityFile(entityFileName));

  return _.compact(issues);
}

module.exports = {
  rule: ddfDataSet => _.concat(
    getIncorrectEntityIdentifierIssues(ddfDataSet),
    getIncorrectConceptIdentifierIssues(ddfDataSet))
};
