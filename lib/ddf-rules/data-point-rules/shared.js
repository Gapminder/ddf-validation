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
  conceptTypeDictionary: dataPointDescriptor => {
    const key = `conceptTypeDictionary@${dataPointDescriptor.dataPointFileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = dataPointDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointDescriptor.dataPointFileDescriptor.headers, 'concept_type');
    }

    return cache[key];
  },
  conceptDomainDictionary: dataPointDescriptor => {
    const key = `conceptDomainDictionary@${dataPointDescriptor.dataPointFileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = dataPointDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointDescriptor.dataPointFileDescriptor.headers, 'domain');
    }

    return cache[key];
  },
  entityValueHash: dataPointDescriptor => {
    const key = `entityValueHash@${dataPointDescriptor.dataPointFileDescriptor.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointDescriptor);
      const entities = dataPointDescriptor.dataPointFileDescriptor.headers
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
    const key = `${type}Keys@${dataPointDescriptor.dataPointFileDescriptor.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointDescriptor);

      cache[key] = Object.keys(conceptTypeDictionary)
        .filter(conceptTypeKey => conceptTypeDictionary[conceptTypeKey] === type);
    }

    return cache[key];
  }
};

exports.cacheFor = cacheFor;
