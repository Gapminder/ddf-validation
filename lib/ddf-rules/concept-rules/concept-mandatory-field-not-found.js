'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

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


module.exports = {
  rule: ddfDataSet =>
    ddfDataSet
      .getConcept()
      .getAllData()
      .filter(conceptRecord => !!conceptRecord.concept)
      .map(conceptRecord => getIssueForConceptMandatoryField(ddfDataSet, conceptRecord))
      .filter(issue => !!issue)
};
