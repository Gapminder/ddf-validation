import * as path from 'path';
import { isEmpty } from 'lodash';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { INCONSISTENT_DATAPACKAGE } from '../registry';
import { DATA_PACKAGE_FILE } from '../../data/data-package';

const isDdfSchemaValid = (dataPackageContent): boolean => {
  return dataPackageContent.ddfSchema && (dataPackageContent.ddfSchema.concepts ||
    dataPackageContent.ddfSchema.entities || dataPackageContent.ddfSchema.datapoints);
};

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const ddfRoot = ddfDataSet.ddfRoot;
    const dataPackagePath = path.resolve(ddfRoot.dataPackageDescriptor.rootFolder, DATA_PACKAGE_FILE);
    const consistencyDescriptor = ddfRoot.dataPackageDescriptor.consistencyDescriptor;
    const dataPackageErrors = ddfRoot.dataPackageDescriptor.errors;

    if (!isEmpty(dataPackageErrors)) {
      return [new Issue(INCONSISTENT_DATAPACKAGE).setPath(dataPackagePath).setData(dataPackageErrors)];
    }

    const issues = [];

    if (!consistencyDescriptor.valid) {
      const errors = consistencyDescriptor.errors.map(error => error.message);

      issues.push(new Issue(INCONSISTENT_DATAPACKAGE).setPath(dataPackagePath).setData(errors));
    }

    if (!isDdfSchemaValid(ddfRoot.dataPackageDescriptor.dataPackageContent)) {
      issues.push(new Issue(INCONSISTENT_DATAPACKAGE)
        .setPath(dataPackagePath).setData({reason: 'ddfSchema section is missing or invalid'}))
    }

    return issues;
  }
};
