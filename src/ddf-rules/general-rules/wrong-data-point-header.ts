import { intersection, includes, isEmpty } from 'lodash';
import { WRONG_DATA_POINT_HEADER } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { FileDescriptor } from '../../data/file-descriptor';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const issues: Issue[] = [];
    const expectedConcepts = ddfDataSet.getConcept().getAllData().filter(conceptRecord =>
      conceptRecord.concept_type === 'entity_domain' ||
      conceptRecord.concept_type === 'entity_set' ||
      conceptRecord.concept_type === 'time').map(conceptRecord => conceptRecord.concept);

    ddfDataSet.getDataPoint().fileDescriptors.forEach((fileDescriptor: FileDescriptor, index: number) => {
      const dataPackage = ddfDataSet.getDataPoint().dataPackageObjects[index].dataPackage;

      const expectedDataPackageResource = dataPackage.resources
        .find(resource => resource.path === fileDescriptor.file);

      const primaryKeyInvalidParts = expectedDataPackageResource.schema.primaryKey
        .filter(partOfPrimaryKey => !includes(expectedConcepts, partOfPrimaryKey));

      const sharedHeaders = intersection(fileDescriptor.headers, expectedDataPackageResource.schema.primaryKey);

      if (!isEmpty(primaryKeyInvalidParts)) {
        issues.push(new Issue(WRONG_DATA_POINT_HEADER)
          .setPath(fileDescriptor.fullPath)
          .setData({primaryKeyInvalidParts, reason: 'some parts of the primary key have an incorrect type'}));
      }

      if (sharedHeaders.length !== expectedDataPackageResource.schema.primaryKey.length) {
        issues.push(new Issue(WRONG_DATA_POINT_HEADER)
          .setPath(fileDescriptor.fullPath)
          .setData({
            sharedHeaders,
            primaryKey: expectedDataPackageResource.schema.primaryKey,
            reason: 'primary from datapackage does not correspond with header from ddf file'
          }));
      }
    });

    return issues;
  }
};
