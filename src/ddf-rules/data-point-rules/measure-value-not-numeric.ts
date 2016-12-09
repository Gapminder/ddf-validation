import {MEASURE_VALUE_NOT_NUMERIC} from '../registry';
import {LINE_NUM_INCLUDING_HEADER} from '../../ddf-definitions/constants';
import {Issue} from '../issue';

const parseDecimalNumber = require('parse-decimal-number');

function isNotNumeric(valueParam) {
  const value = typeof valueParam === 'string' ? valueParam : `${valueParam}`;

  return isNaN(parseDecimalNumber(value));
}

export const rule = {
  isDataPoint: true,
  recordRule: dataPointDescriptor => dataPointDescriptor.fileDescriptor.measures
    .filter(measure => isNotNumeric(dataPointDescriptor.record[measure]))
    .map(measure => new Issue(MEASURE_VALUE_NOT_NUMERIC)
      .setPath(dataPointDescriptor.fileDescriptor.fullPath)
      .setData({
        measure,
        line: dataPointDescriptor.line + LINE_NUM_INCLUDING_HEADER,
        value: dataPointDescriptor.record[measure]
      }))
};
