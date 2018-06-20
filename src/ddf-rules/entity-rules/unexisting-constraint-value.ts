import * as path from 'path';
import { compact, flattenDeep, get as getValue } from 'lodash';
import { UNEXISTING_CONSTRAINT_VALUE } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { DATA_POINT, DOMAIN_ID } from '../../ddf-definitions/constants';
import { Issue } from '../issue';

const checkConstraintValue = (ddfDataSet: DdfDataSet, name: string, value: string): boolean => {
  const allEntities = ddfDataSet.getEntity().getAllData();
  const domainHash = ddfDataSet.getConcept().getDictionary(null, DOMAIN_ID);

  for (const record of allEntities) {
    if (record[name] === value || record[domainHash[name]] === value) {
      return true;
    }
  }

  return false;
};
const forDataPointType = (fileDescriptor: any) => fileDescriptor.type === DATA_POINT;
const constraintValueAreNotPresentInEntities =
  (ddfDataSet: DdfDataSet, name: string, value: string) => !checkConstraintValue(ddfDataSet, name, value);
const getConstraintsByField = (field: any) => getValue<any | string[]>(field, 'constraints.enum', []);

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const dataPackageObject = ddfDataSet.dataPackageDescriptor;

    const issues = dataPackageObject.fileDescriptors.filter(forDataPointType).map((fileDescriptor: any) => {
      const relatedResourceSchema = dataPackageObject.getDataPackageObject().resources
        .find(resource => path.resolve(ddfDataSet.rootPath, resource.path) === fileDescriptor.fullPath);
      const constrainedSchemaFields =
        relatedResourceSchema.schema.fields.filter(field => field.constraints && field.constraints.enum);

      return constrainedSchemaFields.map((field: any) => {
        const issuesSource = getConstraintsByField(field).filter(value =>
          constraintValueAreNotPresentInEntities(ddfDataSet, field.name, value));

        return issuesSource.map(value =>
          new Issue(UNEXISTING_CONSTRAINT_VALUE).setPath(fileDescriptor.fullPath).setData({constraintEntityValue: value}));
      });
    });

    return compact(flattenDeep(issues));
  }
};
