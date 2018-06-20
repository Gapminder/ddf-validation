import * as path from 'path';
import { isEmpty, compact } from 'lodash';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { DATAPACKAGE_NONEXISTENT_RESOURCE } from '../registry';
import { DATA_PACKAGE_FILE } from '../../data/data-package';

const getNonexistentResourcesIssues = (
  ddfDataSet: DdfDataSet,
  dataPackagePath: string,
  resourcesMap: Map<string, number>): Issue[] => {
  if (!ddfDataSet.getDataPackageSchema()) {
    return [];
  }

  return compact([
    ...(ddfDataSet.getDataPackageSchema().concepts || []),
    ...(ddfDataSet.getDataPackageSchema().entities || []),
    ...(ddfDataSet.getDataPackageSchema().datapoints || []),
    ...(ddfDataSet.getDataPackageSchema().synonyms || []),
  ].map(record => {
    const nonexistentResources = record.resources.filter(resource => !resourcesMap.has(resource));

    if (!isEmpty(nonexistentResources)) {
      return new Issue(DATAPACKAGE_NONEXISTENT_RESOURCE)
        .setPath(dataPackagePath)
        .setData({
          nonexistentResources, record,
          specific: 'is NOT found in resources, but found in schema section'
        });
    }

    return null;
  }));
};

const fillResourceMapCounters = (ddfDataSet: DdfDataSet, resourcesMap: Map<string, number>) => {
  if (!ddfDataSet.getDataPackageSchema()) {
    return [];
  }

  [
    ...(ddfDataSet.getDataPackageSchema().concepts || []),
    ...(ddfDataSet.getDataPackageSchema().entities || []),
    ...(ddfDataSet.getDataPackageSchema().datapoints || []),
    ...(ddfDataSet.getDataPackageSchema().synonyms || [])
  ].forEach(record => {
    record.resources.forEach(resource => {
      if (resourcesMap.has(resource)) {
        resourcesMap.set(resource, resourcesMap.get(resource) + 1);
      }

      return resource;
    })
  });
};

const getNonexistentSchemaResourcesIssues = (dataPackagePath: string, resourcesMap: Map<string, number>): Issue[] =>
  Array.from(resourcesMap.keys())
    .filter(resource => resourcesMap.get(resource) === 0)
    .map(resource => new Issue(DATAPACKAGE_NONEXISTENT_RESOURCE)
      .setPath(dataPackagePath)
      .setData({resource, specific: 'is NOT found in ddfSchema schema, but found in resources section'}));

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const dataPackagePath = path.resolve(ddfDataSet.dataPackageDescriptor.rootFolder, DATA_PACKAGE_FILE);
    const resourcesMap = ddfDataSet.getDataPackageResources()
      .map(resource => resource.name)
      .reduce((mapValue, resourceName) => {
        mapValue.set(resourceName, 0);

        return mapValue;
      }, new Map<string, number>());

    fillResourceMapCounters(ddfDataSet, resourcesMap);

    return [
      ...getNonexistentResourcesIssues(ddfDataSet, dataPackagePath, resourcesMap),
      ...getNonexistentSchemaResourcesIssues(dataPackagePath, resourcesMap)
    ];
  }
};
