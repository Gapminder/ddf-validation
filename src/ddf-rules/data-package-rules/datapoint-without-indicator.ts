import { compact, difference, flattenDeep, map, isEmpty } from 'lodash';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { DATA_POINT_WITHOUT_INDICATOR } from '../../ddf-rules/registry';
import { DATA_POINT, getTypeByPrimaryKey } from '../../ddf-definitions/constants';

const getIssues = (ddfDataSet: DdfDataSet): Issue[] => {
  const result: any[] = ddfDataSet.getDataPackageResources()
    .filter(resource => getTypeByPrimaryKey(resource.schema.primaryKey) === DATA_POINT)
    .filter(resource => isEmpty(difference(map(resource.schema.fields, 'name'), resource.schema.primaryKey)))
    .map(resource => new Issue(DATA_POINT_WITHOUT_INDICATOR).setPath(resource.path).setData(resource));

  return compact(flattenDeep(result));
};

export const rule = {
  rule: (ddfDataSet: DdfDataSet): Issue[] => getIssues(ddfDataSet)
};
