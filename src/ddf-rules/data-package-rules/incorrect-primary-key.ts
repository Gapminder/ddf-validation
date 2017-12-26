import { isArray, compact, flattenDeep, intersection, startsWith } from 'lodash';
import { DATAPACKAGE_INCORRECT_PRIMARY_KEY } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { looksLikeIsField } from '../../utils/ddf-things';

const getArrayInAnyCase = (value) => !isArray(value) ? [value] : value;

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.dataPackageDescriptor.getResources().map(resource => {
      const fields = resource.schema.fields.map(field => field.name).filter(field => !looksLikeIsField(field));
      const primaryKey = getArrayInAnyCase(resource.schema.primaryKey);

      if (intersection(fields, primaryKey).length !== primaryKey.length) {
        return new Issue(DATAPACKAGE_INCORRECT_PRIMARY_KEY)
          .setPath(ddfDataSet.ddfRoot.dataPackageDescriptor.rootFolder)
          .setData({fields, primaryKey, reason: 'Primary key is not a part of fields'});
      }

      return null;
    })
  ))
};
