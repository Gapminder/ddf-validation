'use strict';

const _ = require('lodash');
const rx = require('rxjs');
const shared = require('./shared');

function collectDataByCriteria(supportDimension) {
  return (acc, measureRecordDescriptor) => {
    const measureValue = measureRecordDescriptor[0];
    const val = Number(measureValue.data[supportDimension]);
    acc.minValue = Math.min(acc.minValue, val);
    acc.maxValue = Math.max(acc.maxValue, val);
    acc.dimensionsHash = measureRecordDescriptor[1];
    acc.folderPath = measureValue.folderPath;
    acc.fileName = measureValue.fileName;
    acc.data[val] = acc.data[val] || {};

    Object.keys(acc.dimensionsHash).forEach(dimensionKey => {
      // expected dimension should be defined
      if (!acc.dimensionsHash[dimensionKey][measureValue.data[dimensionKey]]) {
        return;
      }

      if (shared
          .isExpectedDimension(
            acc.fileName,
            acc.dimensionsHash,
            dimensionKey,
            measureValue.data[dimensionKey]) === false) {
        return;
      }

      acc.data[val][dimensionKey] = acc.data[val][dimensionKey] || {};
      acc.data[val][dimensionKey][measureValue.data[dimensionKey]] = true;
    });

    return acc;
  };
}

function checkDataPoint(value) {
  let results = [];

  for (let i = value.minValue; i < value.maxValue; i++) {
    Object.keys(value.dimensionsHash).forEach(dimensionKey => {
      const diffs = _.difference(Object.keys(value.dimensionsHash[dimensionKey]), Object.keys(value.data[i][dimensionKey]));
      diffs.forEach(diff => {
        if (value.data[i][dimensionKey] !== true) {
          results.push({
            folderPath: value.folderPath,
            fileName: value.fileName,
            warning: `Dimension ${dimensionKey}.${diff} is absent for ${i}`,
            valid: true
          });
        }
      });
    });
  }

  return results;
}

module.exports = (supportDimension, dimensionsValuesIndex$, measuresData$) => {
  return dimensionsValuesIndex$
    .mergeMap(value => measuresData$.combineLatest(rx.Observable.of(value)))
    .reduce(collectDataByCriteria(supportDimension), {
      minValue: Number.MAX_VALUE,
      maxValue: Number.MIN_VALUE,
      data: {}
    })
    .map(value => checkDataPoint(value))
    // just for now: 500 first results...
    .map(values => values.slice(0, 500))
    .filter(value => value.length > 0);
};
