import { compact, flattenDeep, reduce, keys } from 'lodash';
import {
  CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_ENTITY_SET, isDdfTrue,
  looksLikeIsField
} from '../../utils/ddf-things';
import { CONCEPT_TYPE } from '../../ddf-definitions/constants';

export interface IConstraintDescriptor {
  fullPath: string;
  file: string;
  fieldName: string;
  constraints: string[]
}

let cache;

export const resetCache = () => {
  cache = {};
};

resetCache();

export const cacheFor = {
  conceptTypeDictionary: dataPointDescriptor => {
    const key = `conceptTypeDictionary@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = dataPointDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointDescriptor.fileDescriptor.headers, CONCEPT_TYPE);
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
    const forExpectedFile = (resourceRecord: any) => dataPointDescriptor.fileDescriptor.file === resourceRecord.path;
    const hasConstraints = (field: any) => field.constraints;
    const getSchemaFields = (resourceRecord: any) => resourceRecord.schema && resourceRecord.schema.fields ? resourceRecord.schema.fields : [];
    const key = `${dataPointDescriptor.ddfDataSet.rootPath}@Constraints@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      const dataPackageDescriptor = dataPointDescriptor.ddfDataSet.getDataPackageDescriptor();

      const res = dataPackageDescriptor.getDataPackageObject().resources;

      cache[key] = compact(flattenDeep(
        res.filter(forExpectedFile).map((resourceRecord: any) =>
          getSchemaFields(resourceRecord).filter(hasConstraints).map((field: any) => ({
            fullPath: dataPointDescriptor.fileDescriptor.fullPath,
            file: dataPointDescriptor.fileDescriptor.file,
            fieldName: field.name,
            constraints: field.constraints.enum
          }))
        )
      ));
    }

    return cache[key];
  },
  getEntitiesByRecord: dataPointDescriptor => {
    const key = `recordKeysHash@${dataPointDescriptor.fileDescriptor.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointDescriptor);
      const entities = keys(dataPointDescriptor.record).filter(key =>
        conceptTypeDictionary[key] === CONCEPT_TYPE_ENTITY_DOMAIN || conceptTypeDictionary[key] === CONCEPT_TYPE_ENTITY_SET);

      cache[key] = entities;
    }

    return cache[key];
  },
  getEntityValueHash: dataPointDescriptor => {
    const key = `entityValueHash`;

    if (!cache[key]) {
      const result = {};
      const conceptTypeHash = {};
      const conceptDomainHash = {};
      const conceptsContent = dataPointDescriptor.ddfDataSet.getConcept().getAllData();
      const entitiesContent = dataPointDescriptor.ddfDataSet.getEntity().getAllData();

      for (let conceptRecord of  conceptsContent) {
        conceptTypeHash[conceptRecord.concept] = conceptRecord.concept_type;
        conceptDomainHash[conceptRecord.concept] = conceptRecord.domain;
      }

      for (let entityRecord of entitiesContent) {
        const isEntityWithIsSign = {};
        const recordKeys = keys(entityRecord);

        const looksLikeEntity = key => !looksLikeIsField(key) || (looksLikeIsField(key) && isDdfTrue(entityRecord[key]));
        const isEntity = key => conceptTypeHash[key] === CONCEPT_TYPE_ENTITY_DOMAIN || conceptTypeHash[key] === CONCEPT_TYPE_ENTITY_SET;

        const entitiesSet = reduce(recordKeys, (result, key) => {
          if (looksLikeEntity(key)) {
            const newKey = key.replace(/is--/, '');

            if (looksLikeIsField(key)) {
              isEntityWithIsSign[newKey] = true;
            }

            if (isEntity(newKey)) {
              result.add(newKey);
            }

            if (conceptDomainHash[newKey]) {
              result.add(conceptDomainHash[newKey]);
            }
          }

          return result;
        }, new Set());

        const entities = Array.from(entitiesSet);

        for (let plainEntity of entities) {
          const entityKey = `${plainEntity}@${entityRecord[plainEntity]}`;

          // hash for current entity
          result[entityKey] = entities;

          // hash for domain of current entity
          if (conceptDomainHash[plainEntity]) {
            const entityDomainKey = `${conceptDomainHash[plainEntity]}@${entityRecord[plainEntity]}`;

            result[entityDomainKey] = entities;
          }

          // hashes for is-- based (children) of current entity
          for (let additionalEntityKey of keys(isEntityWithIsSign)) {
            const entityKeyWithIsSign = `${additionalEntityKey}@${entityRecord[plainEntity]}`;

            result[entityKeyWithIsSign] = entities;
          }
        }
      }

      cache[key] = result;
    }

    return cache[key];
  }
};
