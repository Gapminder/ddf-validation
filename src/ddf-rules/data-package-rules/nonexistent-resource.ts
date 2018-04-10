import * as path from 'path';
import { isEmpty, compact } from 'lodash';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { DATAPACKAGE_NONEXISTENT_RESOURCE } from '../registry';
import { DATA_PACKAGE_FILE } from '../../data/data-package';
import { DDFRoot } from '../../data/ddf-root';

const getNonexistentResourcesIssues = (
  ddfRoot: DDFRoot,
  dataPackagePath: string,
  resourcesMap: Map<string, number>): Issue[] => {
  if (!ddfRoot.getDataPackageSchema()) {
    return [];
  }

  return compact([
    ...ddfRoot.getDataPackageSchema().concepts,
    ...ddfRoot.getDataPackageSchema().entities,
    ...ddfRoot.getDataPackageSchema().datapoints
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

const fillResourceMapCounters = (ddfRoot: DDFRoot, resourcesMap: Map<string, number>) => {
  if (!ddfRoot.getDataPackageSchema()) {
    return [];
  }

  [
    ...ddfRoot.getDataPackageSchema().concepts,
    ...ddfRoot.getDataPackageSchema().entities,
    ...ddfRoot.getDataPackageSchema().datapoints
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
    const ddfRoot = ddfDataSet.ddfRoot;
    const dataPackagePath = path.resolve(ddfRoot.dataPackageDescriptor.rootFolder, DATA_PACKAGE_FILE);
    const resourcesMap = ddfRoot.getDataPackageResources()
      .map(resource => resource.name)
      .reduce((mapValue, resourceName) => {
        mapValue.set(resourceName, 0);

        return mapValue;
      }, new Map<string, number>());

    fillResourceMapCounters(ddfRoot, resourcesMap);

    return [
      ...getNonexistentResourcesIssues(ddfRoot, dataPackagePath, resourcesMap),
      ...getNonexistentSchemaResourcesIssues(dataPackagePath, resourcesMap)
    ];
  }
};
