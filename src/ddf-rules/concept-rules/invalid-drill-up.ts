import {isEmpty} from 'lodash';
import {INCORRECT_JSON_FIELD, INVALID_DRILL_UP} from '../registry';
import {allRules}  from '../index';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

function hasConceptRelatedInvalidJSONIssue(ddfDataSet, concept) {
  const incorrectJSONFieldIssues = allRules[INCORRECT_JSON_FIELD].rule(ddfDataSet);

  if (!isEmpty(incorrectJSONFieldIssues)) {
    const relatedIssue = incorrectJSONFieldIssues
      .filter(issue => !!issue.data)
      .find(issue => issue.data.line === concept.$$lineNumber + 1 && issue.path === concept.$$source);

    if (relatedIssue) {
      return true;
    }
  }

  return false;
}

function getDrillUpIssue(ddfDataSet, concept): Issue {
  if (hasConceptRelatedInvalidJSONIssue(ddfDataSet, concept)) {
    return null;
  }

  if (concept.concept_type !== 'entity_set') {
    return new Issue(INVALID_DRILL_UP)
      .setPath(concept.$$source)
      .setData({
        line: concept.$$lineNumber + 1,
        type: concept.concept_type,
        reason: 'not an entity set or domain'
      });
  }

  const drillUps = JSON.parse(concept.drill_up);
  const reasons: Array<any> = drillUps
    .map(drillUpName => {
      const drillUpObject = ddfDataSet.getConcept().getAllData()
        .find(drillUpConceptName => drillUpConceptName.concept === drillUpName);

      let result: any = null;

      if (!drillUpObject) {
        result = {drillUpName, reason: 'Concept for Drillup is not found'};
      }

      if (drillUpObject && drillUpObject.domain !== concept.domain && drillUpObject.concept_type === 'entity_set') {
        result = {
          conceptDomain: drillUpObject.domain,
          expectedDomain: concept.domain,
          reason: 'Domain in a Drillup is not a domain of a concept having this Drillup belongs to'
        };
      }

      if (drillUpObject && concept.domain !== drillUpObject.concept && drillUpObject.concept_type === 'entity_domain') {
        result = {
          conceptDomain: drillUpObject.concept,
          expectedDomain: concept.domain,
          reason: 'Entity domain in Drillup should be same as Entity domain for current Concept'
        };
      }

      return result;
    })
    .filter(reason => !!reason);

  if (!isEmpty(reasons)) {
    return new Issue(INVALID_DRILL_UP)
      .setPath(concept.$$source)
      .setData({
        line: concept.$$lineNumber + 1,
        reasons
      });
  }

  return null;
}

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => ddfDataSet.getConcept().getAllData()
    .filter(concept => concept.drill_up)
    .map(concept => getDrillUpIssue(ddfDataSet, concept))
    .filter(issue => !!issue)
};
