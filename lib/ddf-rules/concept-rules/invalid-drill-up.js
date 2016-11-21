'use strict';

const _ = require('lodash');
const registry = require('../registry');
const generalRules = require('../general-rules');
const Issue = require('../issue');

function hasConceptRelatedInvalidJSONIssue(ddfDataSet, concept) {
  const incorrectJSONFieldIssues = generalRules[registry.INCORRECT_JSON_FIELD].rule(ddfDataSet);

  if (!_.isEmpty(incorrectJSONFieldIssues)) {
    const relatedIssue = incorrectJSONFieldIssues
      .filter(issue => !!issue.data)
      .find(issue => issue.data.line === concept.$$lineNumber + 1 && issue.path === concept.$$source);

    if (relatedIssue) {
      return true;
    }
  }

  return false;
}

function getDrillUpIssue(ddfDataSet, concept) {
  if (hasConceptRelatedInvalidJSONIssue(ddfDataSet, concept)) {
    return null;
  }

  if (concept.concept_type !== 'entity_set') {
    return new Issue(registry.INVALID_DRILL_UP)
      .setPath(concept.$$source)
      .setData({
        line: concept.$$lineNumber + 1,
        type: concept.concept_type,
        reason: 'not an entity set or domain'
      });
  }

  const drillUps = JSON.parse(concept.drill_up);
  const reasons = drillUps
    .map(drillUpName => {
      const drillUpObject = ddfDataSet.getConcept().getAllData()
        .find(drillUpConceptName => drillUpConceptName.concept === drillUpName);

      if (!drillUpObject) {
        return {drillUpName, reason: 'Concept for Drillup is not found'};
      }

      if (drillUpObject.domain !== concept.domain && drillUpObject.concept_type === 'entity_set') {
        return {
          conceptDomain: drillUpObject.domain,
          expectedDomain: concept.domain,
          reason: 'Domain in a Drillup is not a domain of a concept having this Drillup belongs to'
        };
      }

      if (concept.domain !== drillUpObject.concept && drillUpObject.concept_type === 'entity_domain') {
        return {
          conceptDomain: drillUpObject.concept,
          expectedDomain: concept.domain,
          reason: 'Entity domain in Drillup should be same as Entity domain for current Concept'
        };
      }

      return null;
    })
    .filter(reason => !!reason);

  if (!_.isEmpty(reasons)) {
    return new Issue(registry.INVALID_DRILL_UP)
      .setPath(concept.$$source)
      .setData({
        line: concept.$$lineNumber + 1,
        reasons
      });
  }

  return null;
}

module.exports = {
  rule: ddfDataSet => ddfDataSet.getConcept().getAllData()
    .filter(concept => concept.drill_up)
    .map(concept => getDrillUpIssue(ddfDataSet, concept))
    .filter(issue => !!issue)
};
