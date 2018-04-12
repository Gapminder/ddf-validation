import * as path from 'path';
import { keys, includes, isString, head } from 'lodash';
import { ENTITY_VALUE_AS_ENTITY_NAME } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import {
  CONCEPT_TYPE_ENTITY_DOMAIN,
  CONCEPT_TYPE_ENTITY_SET,
  IDataPackageResourceRecord
} from '../../utils/ddf-things';


const getGidByResource = (ddfDataSet: DdfDataSet, entitiesPath: string): string => {
  const ddfRoot = ddfDataSet.ddfRoot;
  const parsedEntitiesPath = path.parse(entitiesPath);
  const relativeDdfPath = path.relative(parsedEntitiesPath.dir, ddfRoot.dataPackageDescriptor.rootFolder);
  const dataPackageCompatiblePath = path.join(relativeDdfPath, parsedEntitiesPath.base);
  const resource: IDataPackageResourceRecord[] = ddfRoot.getDataPackageResources()
    .filter(record => record.path === dataPackageCompatiblePath && isString(record.schema.primaryKey));

  return <string>head(resource).schema.primaryKey;
};

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const entityConcepts = ddfDataSet.getConceptsByType(CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_ENTITY_SET);
    const entitiesByFile = ddfDataSet.getEntity().getDataByFiles();
    const issues = [];

    for (const entityFileName of keys(entitiesByFile)) {
      const gid = getGidByResource(ddfDataSet, entityFileName);

      for (const record of entitiesByFile[entityFileName]) {
        if (includes(entityConcepts, record[gid])) {
          issues.push(new Issue(ENTITY_VALUE_AS_ENTITY_NAME)
            .setPath(record.$$source)
            .setData({
              entityName: gid,
              entityRecord: record
            }))
        }
      }
    }

    return issues;
  }
};
