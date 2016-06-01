'use strict';

const _ = require('lodash');
const registry = require('./registry');
const Issue = require('./issue');
const Levenshtein = require('levenshtein');
const SUGGEST_TOLERANCE = 3;

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
    .concat(getEntityHeaderDetails(ddfDataSet));
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

function getIssueForConceptMandatoryField(ddfDataSet, conceptRecord) {
  const domain = ddfDataSet.getConcept().getRecordByKey(conceptRecord.domain);

  function domainIsNotEntityDomain() {
    return !domain || domain.concept_type !== 'entity_domain';
  }

  function domainIsNotEntitySetOrDomain() {
    return !domain || domain.concept_type !== 'entity_domain' && domain.concept_type !== 'entity_set';
  }

  function isItIssue() {
    return conceptRecord.concept_type === 'entity_set' && domainIsNotEntityDomain() ||
      conceptRecord.concept_type === 'role' && domainIsNotEntitySetOrDomain();
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

  if (isItIssue()) {
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
          .setData({
            line: conceptRecordWithEmptyId.$$lineNumber
          })
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
      .filter(issue => !!issue)
};
