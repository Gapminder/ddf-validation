'use strict';

const rx = require('rxjs');
const shared = require('./shared');

function checkParticularMeasure(dimensionsHash, measureRecord) {
  let errors = [];

  Object.keys(dimensionsHash).forEach(dimensionKey => {
    const expectedField = measureRecord.data[dimensionKey];

    if (!expectedField) {
      errors.push(`Missing dimension: '${dimensionKey}' is absent.'`);
      return;
    }

    if (expectedField && !dimensionsHash[dimensionKey][expectedField]) {
      errors.push(`Unknown value: '${expectedField}' for dimension '${dimensionKey}'.`);
      return;
    }

    if (shared
        .isExpectedDimension(
          measureRecord.fileName,
          dimensionsHash,
          dimensionKey,
          expectedField) === false) {
      // for example, in case of we have 'ddf--data_for--gdp_const_ppp2011_dollar--by--country--year'
      // but this file contains 'non-country' geo value (world_4region, for example)
      errors.push(`Unexpected value: '${expectedField}' for dimension '${dimensionKey}'.`);
    }
  });

  return errors.map(error => {
    return {
      folderPath: measureRecord.folderPath,
      fileName: measureRecord.fileName,
      entry: measureRecord.data,
      errors: {
        message: error
      }
    };
  });
}

module.exports = (dimensionsValuesIndex$, measuresData$) => {
  return dimensionsValuesIndex$
    .mergeMap(value => measuresData$.combineLatest(rx.Observable.of(value)))
    .map(value => checkParticularMeasure(value[1], value[0]))
    .filter(value => value.length > 0);
};
