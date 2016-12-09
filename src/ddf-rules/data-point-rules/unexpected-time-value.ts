import {DATA_POINT_UNEXPECTED_TIME_VALUE} from '../registry';
import {LINE_NUM_INCLUDING_HEADER} from '../../ddf-definitions/constants';
import {cacheFor} from './shared';
import {Issue} from '../issue';

const ddfTimeUtils = require('ddf-time-utils');

export const rule = {
  isDataPoint: true,
  recordRule: dataPointDescriptor =>
    cacheFor.keysByType(dataPointDescriptor, 'time')
      .filter(timeKey => !ddfTimeUtils.detectTimeType(dataPointDescriptor.record[timeKey]))
      .map(timeKey => new Issue(DATA_POINT_UNEXPECTED_TIME_VALUE)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData({
          concept: timeKey,
          line: dataPointDescriptor.line + LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.record[timeKey]
        }))
};
