import { endsWith, isEmpty } from 'lodash';
import { INCONSISTENT_SYNONYM_KEY } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const issues = [];
    const synonymsData = ddfDataSet.getSynonym().getAllData();

    for (const record of synonymsData) {
      const resource = ddfDataSet.getDataPackageResources().find(resource => endsWith(record.$$source, resource.path));
      const primaryKey = resource.schema.primaryKey;
      const undefinedKeyParts = [];

      for (const partOfPrimaryKey of primaryKey) {
        if (isEmpty(record[partOfPrimaryKey])) {
          undefinedKeyParts.push(partOfPrimaryKey);
        }
      }

      if (!isEmpty(undefinedKeyParts)) {
        issues.push(new Issue(INCONSISTENT_SYNONYM_KEY)
          .setPath(record.$$source)
          .setData({line: record.$$lineNumber, undefinedKeyParts}));
      }
    }

    return issues;
  }
};
