import { keys, includes, head, compact, isEmpty, flattenDeep, concat } from 'lodash';
import { INCORRECT_IDENTIFIER } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_ENTITY_SET } from '../../utils/ddf-things';

const NOT_ALPHANUMERIC = /[^a-z0-9_]/;

function getIdentifierColumnsNames(ddfDataSet, firstRecord) {
  const concept = ddfDataSet.getConcept();
  const relatedConceptNames = concept.getDataIdsByType(CONCEPT_TYPE_ENTITY_SET)
    .concat(concept.getDataIdsByType(CONCEPT_TYPE_ENTITY_DOMAIN));

  return keys(firstRecord)
    .filter(entityHeader => includes(relatedConceptNames, entityHeader));
}

function getIncorrectConceptIdentifierIssues(ddfDataSet) {
  return ddfDataSet.getConcept()
    .getAllData()
    .filter(conceptRecord => conceptRecord.concept)
    .filter(conceptRecord => NOT_ALPHANUMERIC.test(conceptRecord.concept))
    .map(conceptRecord =>
      new Issue(INCORRECT_IDENTIFIER)
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
    const entitiesConcepts = getIdentifierColumnsNames(ddfDataSet, head(entitiesByFile[entityFileName]));
    const issueData = compact(flattenDeep(getIssueData(entityFileName, entitiesConcepts)));

    if (!isEmpty(issueData)) {
      return new Issue(INCORRECT_IDENTIFIER)
        .setPath(entityFileName)
        .setData(issueData);
    }

    return null;
  }

  const issues = keys(entitiesByFile)
    .map(entityFileName => getIssueByEntityFile(entityFileName));

  return compact(issues);
}

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => concat(
    getIncorrectEntityIdentifierIssues(ddfDataSet),
    getIncorrectConceptIdentifierIssues(ddfDataSet))
};
