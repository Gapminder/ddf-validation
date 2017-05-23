import { isArray, compact, flattenDeep, intersection, startsWith } from 'lodash';
import { DATAPACKAGE_INCORRECT_PRIMARY_KEY } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

const getArrayInAnyCase = (value) => !isArray(value) ? [value] : value;

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.dataPackage.getResources().map(resource => {
        const fields = resource.schema.fields.map(field => field.name).filter(field => !startsWith(field, 'is--'));
        const primaryKey = getArrayInAnyCase(resource.schema.primaryKey);

        if (intersection(fields, primaryKey).length !== primaryKey.length) {
          return new Issue(DATAPACKAGE_INCORRECT_PRIMARY_KEY)
            .setPath(directoryDescriptor.dataPackage.rootFolder)
            .setData({fields, primaryKey, reason: 'Primary key is not a part of fields'});
        }

        return null;
      })
    )
  ))
};
