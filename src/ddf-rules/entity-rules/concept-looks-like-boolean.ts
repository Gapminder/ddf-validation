import { keys, includes, compact, uniq } from 'lodash';
import { CONCEPT_LOOKS_LIKE_BOOLEAN } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { CONCEPT_TYPE_BOOLEAN, isDdfBoolean, looksLikeIsField } from '../../utils/ddf-things';
import { CONCEPT_TYPE } from '../../ddf-definitions/constants';

const getBooleanValues = (values: string[]) => values.filter(value => isDdfBoolean(value));

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
    const valuesHash = {};

    for (const entityRecord of entities) {
      for (const concept of keys(entityRecord)) {
        if (!includes(booleanConcepts, concept) && !looksLikeIsField(concept)) {
          if (!valuesHash[concept]) {
            valuesHash[concept] = [];
          }

          valuesHash[concept].push(entityRecord[concept]);
        }
      }
    }

    for (const concept of keys(valuesHash)) {
      valuesHash[concept] = uniq(compact(valuesHash[concept]));

      const booleanValues = getBooleanValues(valuesHash[concept]);

      if (booleanValues.length === valuesHash[concept].length && valuesHash[concept].length > 0) {
        issues.push(new Issue(CONCEPT_LOOKS_LIKE_BOOLEAN).setData({concept}));
      }
    }

    return issues;
  }
};
