import { compact, flattenDeep } from 'lodash';
import { DirectoryDescriptor } from '../../data/directory-descriptor';

export interface IConstraintDescriptor {
  fullPath: string;
  file: string;
  fieldName: string;
  constraints: string[]
}

function constructEntityCondition(entity) {
  const expectedKey = `is--${entity}`;

  return {[expectedKey]: {$in: ['TRUE', 'true']}};
}

function getExpectedEntities(ddfData, entityId, conceptDomainDictionary) {
  return ddfData
    .getEntity()
    .getDataBy(constructEntityCondition(entityId))
    .map(entity => entity[conceptDomainDictionary[entityId]] || entity[entityId]);
}

const cache = {};

export const cacheFor = {
  conceptTypeDictionary: dataPointDescriptor => {
    const key = `conceptTypeDictionary@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = dataPointDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointDescriptor.fileDescriptor.headers, 'concept_type');
    }

    return cache[key];
  },
  conceptDomainDictionary: dataPointDescriptor => {
    const key = `conceptDomainDictionary@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = dataPointDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointDescriptor.fileDescriptor.headers, 'domain');
    }

    return cache[key];
  },
  entityValueHash: dataPointDescriptor => {
    const key = `entityValueHash@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointDescriptor);
      const entities = dataPointDescriptor.fileDescriptor.headers
        .filter(concept => conceptTypeDictionary[concept] === 'entity_set');
      const conceptDomainDictionary = cacheFor.conceptDomainDictionary(dataPointDescriptor);
      const entityValueHash = {};

      entities.forEach(entityId => {
        entityValueHash[entityId] =
          getExpectedEntities(dataPointDescriptor.ddfDataSet, entityId, conceptDomainDictionary);
      });

      cache[key] = entityValueHash;
    }

    return cache[key];
  },
  keysByType: (dataPointDescriptor, type) => {
    const key = `${type}Keys@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointDescriptor);

      cache[key] = Object.keys(conceptTypeDictionary)
        .filter(conceptTypeKey => conceptTypeDictionary[conceptTypeKey] === type);
    }

    return cache[key];
  },
  constraintsByFileDescriptor: (dataPointDescriptor): IConstraintDescriptor[] => {
    const forExpectedFile = (currentFileDescriptor: any) => dataPointDescriptor.fileDescriptor.file === currentFileDescriptor.filename;
    const hasConstraints = (field: any) => field.constraints;
    const getSchemaFields = (fileDescriptor: any) => fileDescriptor.schema && fileDescriptor.schema.fields ? fileDescriptor.schema.fields : [];
    const key = `${dataPointDescriptor.ddfDataSet.ddfRoot.path}@Constraints@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = compact(flattenDeep(
        dataPointDescriptor.ddfDataSet.ddfRoot.directoryDescriptors.map((directoryDescriptor: DirectoryDescriptor) =>
          directoryDescriptor.dataPackage.fileDescriptors.filter(forExpectedFile).map((fileDescriptor: any) =>
            getSchemaFields(fileDescriptor).filter(hasConstraints).map((field: any) => ({
              fullPath: dataPointDescriptor.fileDescriptor.fullPath,
              file: dataPointDescriptor.fileDescriptor.file,
              fieldName: field.name,
              constraints: field.constraints.enum
            }))
          )
        )
      ));
    }

    return cache[key];
  }
};
