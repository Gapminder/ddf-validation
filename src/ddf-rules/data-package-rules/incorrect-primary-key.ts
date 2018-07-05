import { isArray, compact, flattenDeep, intersection, isObject } from 'lodash';
import { DATAPACKAGE_INCORRECT_PRIMARY_KEY } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { looksLikeIsField } from '../../utils/ddf-things';
import {
  CONCEPT,
  DATA_POINT,
  ENTITY,
  getArrayInAnyCase,
  getTypeByPrimaryKey,
  SYNONYM
} from '../../ddf-definitions/constants';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const resources = ddfDataSet.getDataPackageResources();
    const schema = ddfDataSet.getDataPackageSchema();

    if (!isObject(schema)) {
      return [new Issue(DATAPACKAGE_INCORRECT_PRIMARY_KEY).setPath(ddfDataSet.dataPackageDescriptor.rootFolder)
        .setData({reason: 'empty ddfSchema section'})];
    }

    const notPartOfFieldsReason = compact(flattenDeep(
      resources.map(resource => {
        const fields = resource.schema.fields.map(field => field.name).filter(field => !looksLikeIsField(field));
        const primaryKey = getArrayInAnyCase(resource.schema.primaryKey);

        if (intersection(fields, primaryKey).length !== primaryKey.length) {
          return new Issue(DATAPACKAGE_INCORRECT_PRIMARY_KEY)
            .setPath(ddfDataSet.dataPackageDescriptor.rootFolder)
            .setData({fields, primaryKey, reason: 'Primary key is not a part of fields'});
        }

        return null;
      })
    ));

    const inconsistentPrimaryKeys = [];

    for (const resource of resources) {
      const primaryKey = isArray(resource.schema.primaryKey) ? resource.schema.primaryKey : [resource.schema.primaryKey];
      const pkType = getTypeByPrimaryKey(primaryKey);

      if (!pkType) {
        inconsistentPrimaryKeys.push(new Issue(DATAPACKAGE_INCORRECT_PRIMARY_KEY)
          .setPath(ddfDataSet.dataPackageDescriptor.rootFolder)
          .setData({primaryKey, reason: 'Unclassified primaryKey in resources'})
        );
      }
    }

    const schemaModes = [
      {type: CONCEPT, section: 'concepts'},
      {type: DATA_POINT, section: 'datapoints'},
      {type: ENTITY, section: 'entities'},
      {type: SYNONYM, section: 'synonyms'}
    ];

    for (const schemaMode of schemaModes) {
      const schemaData = schema[schemaMode.section] || [];

      for (const schemaRecord of schemaData) {
        const pkType = getTypeByPrimaryKey(schemaRecord.primaryKey);

        if (pkType !== schemaMode.type) {
          inconsistentPrimaryKeys.push(new Issue(DATAPACKAGE_INCORRECT_PRIMARY_KEY)
            .setPath(ddfDataSet.dataPackageDescriptor.rootFolder)
            .setData({primaryKey: schemaRecord.primaryKey, reason: 'Unclassified primaryKey in ddfSchema'})
          );
        }
      }
    }

    return [...notPartOfFieldsReason, ...inconsistentPrimaryKeys];
  }
};
