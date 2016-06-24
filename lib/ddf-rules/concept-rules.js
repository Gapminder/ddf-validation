'use strict';

const _ = require('lodash');
const registry = require('./registry');
const generalRules = require('./general-rules');
const Issue = require('./issue');
const Levenshtein = require('levenshtein');
const SUGGEST_TOLERANCE = 3;

function getConceptHeaderDetails(ddfDataSet) {
  const result = [];

  ddfDataSet.getConcept().details.forEach(detail =>
    (detail.fileDescriptor.headers || [])
      .filter(header => header !== 'concept' && header !== 'concept_type')
      .forEach(header => result.push({header, detail})));

  return result;
}

function getDataPointHeaderDetails(ddfDataSet) {
  const result = [];

  ddfDataSet.getDataPoint().details.forEach(detail =>
    detail.fileDescriptor.headers.forEach(header => result.push({header, detail})));

  return result;
}

function getEntityHeaderDetails(ddfDataSet) {
  const result = [];

  ddfDataSet.getEntity().details.forEach(detail => {
    detail.header.forEach(header => {
      if (!_.startsWith(header, 'is--')) {
        result.push({header, detail});
      }
    });
  });

  return result;
}

function getHeaderDetailObjects(ddfDataSet) {
  return getDataPointHeaderDetails(ddfDataSet)
    .concat(getEntityHeaderDetails(ddfDataSet))
    .concat(getConceptHeaderDetails(ddfDataSet));
}

function setNonConceptHeaderIssue(conceptIds, detailObject, result) {
  if (conceptIds.indexOf(detailObject.header) < 0) {
    const suggestions = _.uniq(
      conceptIds
        .map(concept => {
          const levenshtein = new Levenshtein(concept, detailObject.header);

          return {
            concept,
            distance: levenshtein.distance
          };
        })
        .filter(suggest => suggest.distance < SUGGEST_TOLERANCE)
        .map(suggest => suggest.concept)
    );

    const issue = new Issue(registry.NON_CONCEPT_HEADER)
      .setPath(detailObject.detail.fileDescriptor.fullPath)
      .setData(detailObject.header)
      .setSuggestions(suggestions);

    result.push(issue);
  }
}

function domainIsNotEntityDomain(domain) {
  return !domain || domain.concept_type !== 'entity_domain';
}

function domainIsNotEntitySetOrDomain(domain) {
  return domainIsNotEntityDomain(domain) && domain.concept_type !== 'entity_set';
}

function isIssueForEntitySet(domain, conceptRecord) {
  return conceptRecord.concept_type === 'entity_set' && domainIsNotEntityDomain(domain);
}

function isIssueForRole(domain, conceptRecord) {
  return conceptRecord.concept_type === 'role' && domainIsNotEntitySetOrDomain(domain);
}

function getIssueForConceptMandatoryField(ddfDataSet, conceptRecord) {
  const domain = ddfDataSet.getConcept().getRecordByKey(conceptRecord.domain);

  function isIssue() {
    return isIssueForEntitySet(domain, conceptRecord) || isIssueForRole(domain, conceptRecord);
  }

  if (_.isEmpty(conceptRecord.concept_type)) {
    return new Issue(registry.CONCEPT_MANDATORY_FIELD_NOT_FOUND)
      .setPath(conceptRecord.$$source)
      .setData({
        line: conceptRecord.$$lineNumber,
        field: 'concept_type',
        value: JSON.stringify(conceptRecord)
      });
  }

  if (isIssue()) {
    return new Issue(registry.CONCEPT_MANDATORY_FIELD_NOT_FOUND)
      .setPath(conceptRecord.$$source)
      .setData({
        line: conceptRecord.$$lineNumber,
        field: 'domain',
        value: domain
      });
  }

  return null;
}

function getConceptsNotFoundIssue(ddfDataSet) {
  const concepts = ddfDataSet.getConcept().getAllData();

  if (_.isEmpty(concepts)) {
    return new Issue(registry.CONCEPTS_NOT_FOUND);
  }

  return null;
}

function hasConceptRelatedInvalidJSONIssue(ddfDataSet, concept) {
  const incorrectJSONFieldIssues = generalRules[registry.INCORRECT_JSON_FIELD](ddfDataSet);

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
        line: concept.$$lineNumber,
        type: concept.concept_type,
        reason: 'not an entity set'
      });
  }

  const drillUps = JSON.parse(concept.drill_up);

  const reasons = drillUps
    .map(drillUpName => {
      const drillUpObject = ddfDataSet.getConcept().getAllData()
        .find(drillUpConceptName => drillUpConceptName.concept === drillUpName);

      if (!drillUpObject) {
        return {drillUpName, reason: 'concept for drill up is not found'};
      }

      if (drillUpObject.domain !== concept.domain) {
        return {myDomain: concept.domain, drillUpDomain: drillUpObject.domain, reason: 'wrong entity domain'};
      }

      return null;
    })
    .filter(reason => !!reason);

  if (!_.isEmpty(reasons)) {
    return new Issue(registry.INVALID_DRILL_UP)
      .setPath(concept.$$source)
      .setData({
        line: concept.$$lineNumber,
        reasons
      });
  }

  return null;
}

module.exports = {
  [registry.CONCEPT_ID_IS_NOT_UNIQUE]: ddfDataSet => {
    const concept = ddfDataSet.getConcept();
    const paths = concept.details.map(detail => detail.fileDescriptor.fullPath);
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
  },
  [registry.EMPTY_CONCEPT_ID]: ddfDataSet =>
    ddfDataSet
      .getConcept()
      .getAllData()
      .filter(conceptRecord => !conceptRecord.concept)
      .map(conceptRecordWithEmptyId =>
        new Issue(registry.EMPTY_CONCEPT_ID)
          .setPath(conceptRecordWithEmptyId.$$source)
          .setData({line: conceptRecordWithEmptyId.$$lineNumber})
      ),
  [registry.NON_CONCEPT_HEADER]: ddfDataSet => {
    const result = [];
    const conceptIds = ddfDataSet.getConcept().getIds();

    getHeaderDetailObjects(ddfDataSet)
      .map(headerDetailObject =>
        setNonConceptHeaderIssue(conceptIds, headerDetailObject, result));

    return result;
  },
  [registry.CONCEPT_MANDATORY_FIELD_NOT_FOUND]: ddfDataSet =>
    ddfDataSet
      .getConcept()
      .getAllData()
      .filter(conceptRecord => !!conceptRecord.concept)
      .map(conceptRecord => getIssueForConceptMandatoryField(ddfDataSet, conceptRecord))
      .filter(issue => !!issue),
  [registry.CONCEPTS_NOT_FOUND]: ddfDataSet => getConceptsNotFoundIssue(ddfDataSet),
  [registry.INVALID_DRILL_UP]: ddfDataSet => ddfDataSet.getConcept().getAllData()
    .filter(concept => concept.drill_up)
    .map(concept => getDrillUpIssue(ddfDataSet, concept))
    .filter(issue => !!issue)
};
