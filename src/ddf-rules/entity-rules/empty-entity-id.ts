import { endsWith } from 'lodash';
import { EMPTY_ENTITY_ID } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => ddfDataSet.getEntity().getAllData()
    .filter(record => {
      const resource = ddfDataSet.getDataPackageResources().find(resource => endsWith(record.$$source, resource.path));
      const primaryKey = resource.schema.primaryKey;

      return !record[primaryKey];
    })
    .map(conceptRecordWithEmptyId => new Issue(EMPTY_ENTITY_ID)
      .setPath(conceptRecordWithEmptyId.$$source)
      .setData({line: conceptRecordWithEmptyId.$$lineNumber}))
};
