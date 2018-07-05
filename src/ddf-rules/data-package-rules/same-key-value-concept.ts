import { isEmpty, includes, concat, compact } from 'lodash';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { SAME_KEY_VALUE_CONCEPT } from '../registry';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const schemaBlock = ddfDataSet.getDataPackageSchema();

    if (isEmpty(schemaBlock)) {
      return [];
    }

    const schema = compact(concat(
      ddfDataSet.getDataPackageSchema().concepts,
      ddfDataSet.getDataPackageSchema().entities,
      ddfDataSet.getDataPackageSchema().datapoints,
      ddfDataSet.getDataPackageSchema().synonyms
    ));

    const issues = schema
      .filter(schemaRecord => includes(schemaRecord.primaryKey, schemaRecord.value))
      .map(schemaRecord => new Issue(SAME_KEY_VALUE_CONCEPT)
        .setPath(ddfDataSet.dataPackageDescriptor.rootFolder)
        .setData({schemaRecord, reason: `Value ${schemaRecord.value} already exists in primaryKey`}));

    return issues;
  }
};
