import {keys, isEmpty, head, startsWith, includes} from 'lodash';
import {WRONG_ENTITY_IS_VALUE} from '../registry';
import {LINE_NUM_INCLUDING_HEADER} from  '../../ddf-definitions/constants';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

const IS_HEADER_PREFIX = 'is--';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const result = [];
    const entities = ddfDataSet.getEntity().getDataByFiles();
    const entityFiles = keys(entities);
    const VALUE_TEMPLATE = ['true', 'false', 'TRUE', 'FALSE'];

    entityFiles.forEach(entityFile => {
      if (!isEmpty(entities[entityFile])) {
        const expectedKeys = keys(head(entities[entityFile]))
          .filter(entityRecordKey =>
            startsWith(entityRecordKey, IS_HEADER_PREFIX));

        entities[entityFile].forEach(entityRecord => {
          expectedKeys.forEach(key => {
            if (!includes(VALUE_TEMPLATE, entityRecord[key])) {
              const data = {
                header: key,
                line: entityRecord.$$lineNumber + LINE_NUM_INCLUDING_HEADER,
                value: entityRecord[key]
              };
              const issue = new Issue(WRONG_ENTITY_IS_VALUE)
                .setPath(entityFile)
                .setData(data);

              result.push(issue);
            }
          });
        });
      }
    });

    return result;
  }
};
