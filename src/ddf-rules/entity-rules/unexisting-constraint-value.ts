import { compact, flattenDeep, get as getValue } from 'lodash';
import { UNEXISTING_CONSTRAINT_VALUE } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { DirectoryDescriptor } from '../../data/directory-descriptor';
import { DATA_POINT } from '../../ddf-definitions/constants';
import { Issue } from '../issue';

const checkConstraintValue = (ddfDataSet: DdfDataSet, name: string, value: string): boolean => {
  const allEntities = ddfDataSet.getEntity().getAllData();

  for (const record of allEntities) {
    if (record[name] === value) {
      return true;
    }
  }

  return false;
};
const forDataPointType = (fileDescriptor: any) => fileDescriptor.type === DATA_POINT;
const constraintsAreExists = (field: any) => field.constraints && field.constraints.enum;
const constraintValueAreNotPresentInEntities =
  (ddfDataSet: DdfDataSet, name: string, value: string) => !checkConstraintValue(ddfDataSet, name, value);
const getConstraintsByField = (field: any) => getValue<any | string[]>(field, 'constraints.enum', []);
const getSchemaFields = (fileDescriptor: any) => getValue<any | any[]>(fileDescriptor, 'schema.fields', []);

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const issues = ddfDataSet.ddfRoot.directoryDescriptors.map((directoryDescriptor: DirectoryDescriptor) =>
      directoryDescriptor.dataPackage.fileDescriptors.filter(forDataPointType).map((fileDescriptor: any) => {
        const constrainedSchemaFields = getSchemaFields(fileDescriptor).filter(constraintsAreExists);

        return constrainedSchemaFields.map((field: any) => {
          const issuesSource = getConstraintsByField(field).filter(value => constraintValueAreNotPresentInEntities(ddfDataSet, field.name, value));

          return issuesSource.map(value =>
            new Issue(UNEXISTING_CONSTRAINT_VALUE).setPath(fileDescriptor.fullPath).setData({constraintEntityValue: value}));
        });
      }));

    return compact(flattenDeep(issues));
  }
};
