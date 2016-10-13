'use strict';

const _ = require('lodash');
const parseDecimalNumber = require('parse-decimal-number');
const ddfTimeUtils = require('ddf-time-utils');
const registry = require('./registry');
const Issue = require('./issue');
const constants = require('../ddf-definitions/constants');

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

function isNotNumeric(valueParam) {
  const value = typeof valueParam === 'string' ? valueParam : `${valueParam}`;

  return isNaN(parseDecimalNumber(value));
}

const cache = {};
const cacheFor = {
  conceptTypeDictionary: dataPointDescriptor => {
    const key = `conceptTypeDictionary@${dataPointDescriptor.dataPointDetail.fileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = dataPointDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointDescriptor.dataPointDetail.fileDescriptor.details.concepts, 'concept_type');
    }

    return cache[key];
  },
  conceptDomainDictionary: dataPointDescriptor => {
    const key = `conceptDomainDictionary@${dataPointDescriptor.dataPointDetail.fileDescriptor.file}`;

    if (!cache[key]) {
      cache[key] = dataPointDescriptor.ddfDataSet.getConcept()
        .getDictionary(dataPointDescriptor.dataPointDetail.fileDescriptor.details.concepts, 'domain');
    }

    return cache[key];
  },
  entityValueHash: dataPointDescriptor => {
    const key = `entityValueHash@${dataPointDescriptor.dataPointDetail.fileDescriptor.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointDescriptor);
      const entities = dataPointDescriptor.dataPointDetail.fileDescriptor.details.concepts
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
    const key = `${type}Keys@${dataPointDescriptor.dataPointDetail.fileDescriptor.file}`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(dataPointDescriptor);

      cache[key] = Object.keys(conceptTypeDictionary)
        .filter(conceptTypeKey => conceptTypeDictionary[conceptTypeKey] === type);
    }

    return cache[key];
  }
};

module.exports = {
  [registry.MEASURE_VALUE_NOT_NUMERIC]: dataPointDescriptor =>
    dataPointDescriptor.dataPointDetail.fileDescriptor.details.measures
      .filter(measure => isNotNumeric(dataPointDescriptor.dataPointRecord[measure]))
      .map(measure => new Issue(registry.MEASURE_VALUE_NOT_NUMERIC)
        .setPath(dataPointDescriptor.dataPointDetail.fileDescriptor.fullPath)
        .setData({
          measure,
          line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.dataPointRecord[measure]
        })),
  [registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: dataPointDescriptor => {
    const entityValueHash = cacheFor.entityValueHash(dataPointDescriptor);

    return Object.keys(entityValueHash)
      .filter(entityKey => !_.includes(entityValueHash[entityKey], dataPointDescriptor.dataPointRecord[entityKey]))
      .map(entityKey => new Issue(registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE)
        .setPath(dataPointDescriptor.dataPointDetail.fileDescriptor.fullPath)
        .setData({
          concept: entityKey,
          line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.dataPointRecord[entityKey]
        }));
  },
  [registry.DATA_POINT_UNEXPECTED_TIME_VALUE]: dataPointDescriptor =>
    cacheFor.keysByType(dataPointDescriptor, 'time')
      .filter(timeKey => !ddfTimeUtils.detectTimeType(dataPointDescriptor.dataPointRecord[timeKey]))
      .map(timeKey => new Issue(registry.DATA_POINT_UNEXPECTED_TIME_VALUE)
        .setPath(dataPointDescriptor.dataPointDetail.fileDescriptor.fullPath)
        .setData({
          concept: timeKey,
          line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.dataPointRecord[timeKey]
        }))
};
