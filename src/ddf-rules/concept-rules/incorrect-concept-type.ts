import {includes} from 'lodash';
import {INCORRECT_CONCEPT_TYPE} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

const CONCEPT_TYPES = [
  'boolean', 'string', 'measure', 'entity_domain', 'entity_set', 'time',
  'year', 'week', 'month', 'day', 'quarter', 'interval', 'role', 'custom_type'
];

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const conceptData = ddfDataSet.getConcept().getAllData();
    const issues = [];

    for (let record of conceptData) {
      if (!includes(CONCEPT_TYPES, record.concept_type)) {
        const issue = new Issue(INCORRECT_CONCEPT_TYPE)
          .setPath(record.$$source)
          .setData({lineNumber: record.$$lineNumber, type: record.concept_type});

        issues.push(issue);
      }
    }
    return issues;
  }
};
