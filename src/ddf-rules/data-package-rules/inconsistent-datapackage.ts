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
    const dataPackagePath = path.resolve(ddfDataSet.dataPackageDescriptor.rootFolder, DATA_PACKAGE_FILE);
    const consistencyDescriptor = ddfDataSet.dataPackageDescriptor.consistencyDescriptor;
    const dataPackageErrors = ddfDataSet.dataPackageDescriptor.errors;
    const issues = [];

    if (!isEmpty(dataPackageErrors)) {
      issues.push(new Issue(INCONSISTENT_DATAPACKAGE).setPath(dataPackagePath).setData(dataPackageErrors));
    }

    if (!consistencyDescriptor.valid) {
      const errors = consistencyDescriptor.errors.map(error => error.message);

      issues.push(new Issue(INCONSISTENT_DATAPACKAGE).setPath(dataPackagePath).setData(errors));
    }

    if (!isDdfSchemaValid(ddfDataSet.dataPackageDescriptor.getDataPackageObject())) {
      issues.push(new Issue(INCONSISTENT_DATAPACKAGE)
        .setPath(dataPackagePath).setData({reason: 'ddfSchema section is missing or invalid'}))
    }

    return issues;
  }
};
