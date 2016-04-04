'use strict';

const registry = require('./registry');
const Issue = require('./issue');
const LINE_NUM_INCLUDING_HEADER = 2;

module.exports = {
  [registry.DATA_POINT_VALUE_NOT_NUMERIC]: (ddfData, dataPointDetail) => {
    const result = [];

    dataPointDetail.fileDescriptor.details.measures.forEach(measure => {
      ddfData.getDataPoint().content.forEach((dataPointRecord, line) => {
        if (isNaN(dataPointRecord[measure]) === true) {
          result.push(
            new Issue(
              registry.DATA_POINT_VALUE_NOT_NUMERIC,
              dataPointDetail.fileDescriptor.fullPath,
              {
                measure,
                line: line + LINE_NUM_INCLUDING_HEADER,
                value: dataPointRecord[measure]
              })
          );
        }
      });
    });

    return result;
  }
};
