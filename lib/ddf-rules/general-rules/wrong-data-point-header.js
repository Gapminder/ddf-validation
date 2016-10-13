'use strict';

const _ = require('lodash');
const registry = require('../registry');
const Issue = require('../issue');

const cache = {};
const cacheFor = {
  conceptTypeDictionary: ddfDataSet => {
    const key = 'conceptTypeDictionary';

    if (!cache[key]) {
      cache[key] = ddfDataSet.getConcept().getDictionary(null, 'concept_type');
    }

    return cache[key];
  },
  keysByType: (ddfDataSet, type) => {
    const key = `${type}Keys`;

    if (!cache[key]) {
      const conceptTypeDictionary = cacheFor.conceptTypeDictionary(ddfDataSet);

      cache[key] = Object
        .keys(conceptTypeDictionary)
        .filter(conceptTypeKey => conceptTypeDictionary[conceptTypeKey] === type);
    }

    return cache[key];
  }
};

module.exports = {
  rule: ddfDataSet => _.compact(
    ddfDataSet.getDataPoint().details
      .map(dataPointDescriptor => {
        const allStringConcepts = cacheFor.keysByType(ddfDataSet, 'string');
        const wrongConcepts = _.intersection(allStringConcepts, dataPointDescriptor.fileDescriptor.headers);

        if (_.isEmpty(wrongConcepts)) {
          return null;
        }

        return new Issue(registry.WRONG_DATA_POINT_HEADER)
          .setPath(dataPointDescriptor.fileDescriptor.fullPath)
          .setData({wrongConcepts, reason: 'string type based concepts'});
      })
  )
};
