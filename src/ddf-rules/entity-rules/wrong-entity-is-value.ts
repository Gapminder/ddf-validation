import { keys, isEmpty, head } from 'lodash';
import { WRONG_ENTITY_IS_VALUE } from '../registry';
import { LINE_NUM_INCLUDING_HEADER } from '../../ddf-definitions/constants';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { isDdfBoolean, looksLikeIsField } from '../../utils/ddf-things';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const result = [];
    const entities = ddfDataSet.getEntity().getDataByFiles();
    const entityFiles = keys(entities);

    entityFiles.forEach(entityFile => {
      if (!isEmpty(entities[entityFile])) {
        const expectedKeys = keys(head(entities[entityFile]))
          .filter(entityRecordKey => looksLikeIsField(entityRecordKey));

        entities[entityFile].forEach(entityRecord => {
          expectedKeys.forEach(key => {
            if (!isDdfBoolean(entityRecord[key])) {
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
