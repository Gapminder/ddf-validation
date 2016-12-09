import {isEmpty} from 'lodash';
import {CONCEPTS_NOT_FOUND} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

function getConceptsNotFoundIssue(ddfDataSet) {
  const concepts = ddfDataSet.getConcept().getAllData();

  if (isEmpty(concepts)) {
    return new Issue(CONCEPTS_NOT_FOUND);
  }

  return null;
}

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => getConceptsNotFoundIssue(ddfDataSet)
};
