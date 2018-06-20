import { isEmpty } from 'lodash';
import { CONCEPT_MANDATORY_FIELD_NOT_FOUND } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_ENTITY_SET, CONCEPT_TYPE_ROLE } from '../../utils/ddf-things';
import { CONCEPT_TYPE, DOMAIN_ID } from '../../ddf-definitions/constants';

function domainIsNotEntityDomain(domain) {
  return !domain || domain.concept_type !== CONCEPT_TYPE_ENTITY_DOMAIN;
}

function domainIsNotEntitySetOrDomain(domain) {
  return domainIsNotEntityDomain(domain) && domain.concept_type !== CONCEPT_TYPE_ENTITY_SET;
}

function isIssueForEntitySet(domain, conceptRecord) {
  return conceptRecord.concept_type === CONCEPT_TYPE_ENTITY_SET && domainIsNotEntityDomain(domain);
}

function isIssueForRole(domain, conceptRecord) {
  return conceptRecord.concept_type === CONCEPT_TYPE_ROLE && domainIsNotEntitySetOrDomain(domain);
}

function getIssueForConceptMandatoryField(ddfDataSet, conceptRecord) {
  const domain = ddfDataSet.getConcept().getRecordByKey(conceptRecord.domain);

  function isIssue() {
    return isIssueForEntitySet(domain, conceptRecord) || isIssueForRole(domain, conceptRecord);
  }

  if (isEmpty(conceptRecord.concept_type)) {
    return new Issue(CONCEPT_MANDATORY_FIELD_NOT_FOUND)
      .setPath(conceptRecord.$$source)
      .setData({
        line: conceptRecord.$$lineNumber,
        field: CONCEPT_TYPE,
        value: JSON.stringify(conceptRecord)
      });
  }

  if (isIssue()) {
    return new Issue(CONCEPT_MANDATORY_FIELD_NOT_FOUND)
      .setPath(conceptRecord.$$source)
      .setData({
        line: conceptRecord.$$lineNumber,
        field: DOMAIN_ID,
        value: domain
      });
  }

  return null;
}

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => ddfDataSet
    .getConcept()
    .getAllData()
    .filter(conceptRecord => !!conceptRecord.concept)
    .map(conceptRecord => getIssueForConceptMandatoryField(ddfDataSet, conceptRecord))
    .filter(issue => !!issue)
};
