'use strict';

const _ = require('lodash');
const ddfTimeUtils = require('ddf-time-utils');
const registry = require('./registry');
const Issue = require('./issue');
const LINE_NUM_INCLUDING_HEADER = 2;

function constructEntityCondition(entity) {
  const espectedKey = `is--${entity}`;

  return {
    [espectedKey]: {$in: ['1', 'TRUE', 'true']}
  };
}

function getExpectedEntities(ddfData, entityId, conceptDomainDictionary) {
  return ddfData
    .getEntity()
    .getDataBy(constructEntityCondition(entityId))
    .map(entity => entity[conceptDomainDictionary[entityId]]);
}

module.exports = {
  [registry.DATA_POINT_VALUE_NOT_NUMERIC]: (ddfDataSet, dataPointDetail) => {
    const result = [];

    dataPointDetail.fileDescriptor.details.measures.forEach(measure => {
      ddfDataSet.getDataPoint().content.forEach((dataPointRecord, line) => {
        if (isNaN(dataPointRecord[measure])) {
          const data = {
            measure,
            line: line + LINE_NUM_INCLUDING_HEADER,
            value: dataPointRecord[measure]
          };
          const issue = new Issue(registry.DATA_POINT_VALUE_NOT_NUMERIC)
            .setPath(dataPointDetail.fileDescriptor.fullPath)
            .setData(data);

          result.push(issue);
        }
      });
    });

    return result;
  },
  [registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: (ddfDataSet, dataPointDetail) => {
    const result = [];
    const conceptTypeDictionary = ddfDataSet.getConcept()
      .getDictionary(dataPointDetail.fileDescriptor.details.concepts, 'concept_type');
    const conceptDomainDictionary = ddfDataSet.getConcept()
      .getDictionary(dataPointDetail.fileDescriptor.details.concepts, 'domain');
    const entities = dataPointDetail.fileDescriptor.details.concepts
      .filter(concept => conceptTypeDictionary[concept] === 'entity_set');
    const entityValueHash = {};

    entities.forEach(entityId => {
      entityValueHash[entityId] = getExpectedEntities(ddfDataSet, entityId, conceptDomainDictionary);
    });

    ddfDataSet.getDataPoint().content.forEach((dataPointRecord, line) => {
      Object.keys(entityValueHash).forEach(entityKey => {
        if (!_.includes(entityValueHash[entityKey], dataPointRecord[entityKey])) {
          const data = {
            concept: entityKey,
            line: line + LINE_NUM_INCLUDING_HEADER,
            value: dataPointRecord[entityKey]
          };
          const issue = new Issue(registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE)
            .setPath(dataPointDetail.fileDescriptor.fullPath)
            .setData(data);

          result.push(issue);
        }
      });
    });

    return result;
  },
  [registry.DATA_POINT_UNEXPECTED_TIME_VALUE]: (ddfDataSet, dataPointDetail) => {
    const result = [];
    const conceptTypeDictionary = ddfDataSet.getConcept()
      .getDictionary(dataPointDetail.fileDescriptor.details.concepts, 'concept_type');
    const timeKeys = Object.keys(conceptTypeDictionary)
      .filter(key => conceptTypeDictionary[key] === 'time');

    ddfDataSet.getDataPoint().content.forEach((dataPointRecord, line) => {
      timeKeys.forEach(timeKey => {
        if (!ddfTimeUtils.detectTimeType(dataPointRecord[timeKey])) {
          const data = {
            concept: timeKey,
            line: line + LINE_NUM_INCLUDING_HEADER,
            value: dataPointRecord[timeKey]
          };
          const issue = new Issue(registry.DATA_POINT_UNEXPECTED_TIME_VALUE)
            .setPath(dataPointDetail.fileDescriptor.fullPath)
            .setData(data);

          result.push(issue);
        }
      });
    });

    return result;
  }
};
