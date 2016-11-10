'use strict';

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
const cacheFor = {
  conceptTypeDictionary: dataPointFileDescriptor => {
    const key = `conceptTypeDictionary@${dataPointFileDescriptor.dataPointDetail.file}`;

    if (!cache[key]) {
      cache[key] = dataPointFileDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointFileDescriptor.dataPointDetail.headers, 'concept_type');
    }

    return cache[key];
  },
  conceptDomainDictionary: dataPointFileDescriptor => {
    const key = `conceptDomainDictionary@${dataPointFileDescriptor.dataPointDetail.file}`;

    if (!cache[key]) {
      cache[key] = dataPointFileDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointFileDescriptor.dataPointDetail.headers, 'domain');
    }

    return cache[key];
  },
  entityValueHash: dataPointFileDescriptor => {
    const key = `entityValueHash@${dataPointFileDescriptor.dataPointDetail.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointFileDescriptor);
      const entities = dataPointFileDescriptor.dataPointDetail.headers
        .filter(concept => conceptTypeDictionary[concept] === 'entity_set');
      const conceptDomainDictionary = cacheFor.conceptDomainDictionary(dataPointFileDescriptor);
      const entityValueHash = {};

      entities.forEach(entityId => {
        entityValueHash[entityId] =
          getExpectedEntities(dataPointFileDescriptor.ddfDataSet, entityId, conceptDomainDictionary);
      });

      cache[key] = entityValueHash;
    }

    return cache[key];
  },
  keysByType: (dataPointFileDescriptor, type) => {
    const key = `${type}Keys@${dataPointFileDescriptor.dataPointDetail.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointFileDescriptor);

      cache[key] = Object.keys(conceptTypeDictionary)
        .filter(conceptTypeKey => conceptTypeDictionary[conceptTypeKey] === type);
    }

    return cache[key];
  }
};

exports.cacheFor = cacheFor;
