'use strict';

const _ = require('lodash');
const ddfTimeUtils = require('ddf-time-utils');
const registry = require('./registry');
const Issue = require('./issue');
const constants = require('../ddf-definitions/constants');

function constructEntityCondition(entity) {
  const expectedKey = `is--${entity}`;

  return {
    [expectedKey]: {$in: ['1', 'TRUE', 'true']}
  };
}

function getExpectedEntities(ddfData, entityId, conceptDomainDictionary) {
  return ddfData
    .getEntity()
    .getDataBy(constructEntityCondition(entityId))
    .map(entity => entity[conceptDomainDictionary[entityId]]);
}

module.exports = {
  [registry.MEASURE_VALUE_NOT_NUMERIC]: dataPointDescriptor => {
    const result = [];

    dataPointDescriptor.dataPointDetail.fileDescriptor.details.measures.forEach(measure => {
      if (isNaN(dataPointDescriptor.dataPointRecord[measure])) {
        const data = {
          measure,
          line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.dataPointRecord[measure]
        };
        const issue = new Issue(registry.MEASURE_VALUE_NOT_NUMERIC)
          .setPath(dataPointDescriptor.dataPointDetail.fileDescriptor.fullPath)
          .setData(data);

        result.push(issue);
      }
    });

    return result;
  },
  [registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: dataPointDescriptor => {
    const result = [];
    const conceptTypeDictionary = dataPointDescriptor.ddfDataSet.getConcept()
      .getDictionary(dataPointDescriptor.dataPointDetail.fileDescriptor.details.concepts, 'concept_type');
    const conceptDomainDictionary = dataPointDescriptor.ddfDataSet.getConcept()
      .getDictionary(dataPointDescriptor.dataPointDetail.fileDescriptor.details.concepts, 'domain');
    const entities = dataPointDescriptor.dataPointDetail.fileDescriptor.details.concepts
      .filter(concept => conceptTypeDictionary[concept] === 'entity_set');
    const entityValueHash = {};

    entities.forEach(entityId => {
      entityValueHash[entityId] =
        getExpectedEntities(dataPointDescriptor.ddfDataSet, entityId, conceptDomainDictionary);
    });

    Object.keys(entityValueHash).forEach(entityKey => {
      if (!_.includes(entityValueHash[entityKey], dataPointDescriptor.dataPointRecord[entityKey])) {
        const data = {
          concept: entityKey,
          line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.dataPointRecord[entityKey]
        };
        const issue = new Issue(registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE)
          .setPath(dataPointDescriptor.dataPointDetail.fileDescriptor.fullPath)
          .setData(data);

        result.push(issue);
      }
    });

    return result;
  },
  [registry.DATA_POINT_UNEXPECTED_TIME_VALUE]: dataPointDescriptor => {
    const result = [];
    const conceptTypeDictionary = dataPointDescriptor.ddfDataSet.getConcept()
      .getDictionary(dataPointDescriptor.dataPointDetail.fileDescriptor.details.concepts, 'concept_type');
    const timeKeys = Object.keys(conceptTypeDictionary)
      .filter(key => conceptTypeDictionary[key] === 'time');


    timeKeys.forEach(timeKey => {
      if (!ddfTimeUtils.detectTimeType(dataPointDescriptor.dataPointRecord[timeKey])) {
        const data = {
          concept: timeKey,
          line: dataPointDescriptor.line + constants.LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.dataPointRecord[timeKey]
        };
        const issue = new Issue(registry.DATA_POINT_UNEXPECTED_TIME_VALUE)
          .setPath(dataPointDescriptor.dataPointDetail.fileDescriptor.fullPath)
          .setData(data);

        result.push(issue);
      }
    });

    return result;
  }
};
