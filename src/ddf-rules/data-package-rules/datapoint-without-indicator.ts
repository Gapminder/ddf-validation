import {compact, difference, flattenDeep, map, isArray, isEmpty} from 'lodash';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';
import {DATA_POINT_WITHOUT_INDICATOR} from '../../ddf-rules/registry';

const getIssues = (ddfDataSet: DdfDataSet): Array<Issue> => {
  const result: Array<any> = ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
    directoryDescriptor.dataPackage.dataPackage.resources
      .filter(resource => isArray(resource.schema.primaryKey))
      .filter(resource => isEmpty(difference(map(resource.schema.fields, 'name'), resource.schema.primaryKey)))
      .map(resource => new Issue(DATA_POINT_WITHOUT_INDICATOR).setPath(resource.path).setData(resource)));

  return compact(flattenDeep(result));
};

export const rule = {
  rule: (ddfDataSet: DdfDataSet): Array<Issue> => getIssues(ddfDataSet)
};
