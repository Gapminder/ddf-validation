import { keys, isEmpty } from 'lodash';
import { INCORRECT_BOOLEAN_ENTITY } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { CONCEPT_TYPE_BOOLEAN, isDdfBoolean } from '../../utils/ddf-things';
import { CONCEPT_TYPE } from '../../ddf-definitions/constants';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const typesHash = ddfDataSet.getConcept().getDictionary(null, CONCEPT_TYPE);
    const booleanConcepts = [];
    const issues = [];

    for (const conceptName of keys(typesHash)) {
      if (typesHash[conceptName] === CONCEPT_TYPE_BOOLEAN) {
        booleanConcepts.push(conceptName);
      }
    }

    const entities = ddfDataSet.getEntity().getAllData();

    for (const entityRecord of entities) {
      const fieldsWithWrongValues = [];

      for (const booleanConcept of booleanConcepts) {
        if (entityRecord[booleanConcept]) {
          if (!isDdfBoolean(entityRecord[booleanConcept])) {
            fieldsWithWrongValues.push(booleanConcept);
          }
        }
      }

      if (!isEmpty(fieldsWithWrongValues)) {
        const issue = new Issue(INCORRECT_BOOLEAN_ENTITY)
          .setPath(entityRecord.$$source)
          .setData({
            record: entityRecord,
            fieldsWithWrongValues,
            line: entityRecord.$$lineNumber
          });

        issues.push(issue);
      }
    }

    return issues;
  }
};
