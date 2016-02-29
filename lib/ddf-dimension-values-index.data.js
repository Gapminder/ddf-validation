const _ = require('lodash');
const path = require('path');
const dimensionValuesSchema = require('../ddf-schema/ddf-dimension-values.schema');
const rxReadCsv = require('../utils/rx-read-csv-file-to-json');

module.exports = folderPath => {
  const filesInFolder$ = require('../utils/rx-read-files-in-folder')(folderPath)
    .map(fileName => path.basename(fileName));
  // filter dimensions values files
  const dimensionValuesFiles$ = filesInFolder$
    .filter(fileName => dimensionValuesSchema.fileExp.test(fileName));

  return dimensionValuesFiles$
    .mergeMap(fileName => {
      const rows$ = rxReadCsv(path.join(folderPath, fileName));
      const rowsObj$ = rows$.first().mergeMapTo(rows$, _.zipObject);
      const dimensions = dimensionValuesSchema.dimensions(fileName);

      return rowsObj$.reduce((memo, entry) => {
        _.each(dimensions, dim => {
          if (entry[dim]) {
            memo[dim] = memo[dim] || {};
            // entry.is contains information about kind of this record
            memo[dim][entry[dim]] = entry.is;
          }
        });
        return memo;
      }, {});
    })
    .reduce((memo, entry) => {
      _.each(Object.keys(entry), key => {
        memo[key] = Object.assign({}, memo[key], entry[key]);
      });
      return memo;
    }, {});
};
