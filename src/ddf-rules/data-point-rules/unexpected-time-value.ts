import { DATA_POINT_UNEXPECTED_TIME_VALUE } from '../registry';
import { LINE_NUM_INCLUDING_HEADER } from '../../ddf-definitions/constants';
import { cacheFor, resetCache } from './shared';
import { Issue } from '../issue';
import { CONCEPT_TYPE_TIME } from '../../utils/ddf-things';

const ddfTimeUtils = require('ddf-time-utils');

export const rule = {
  isDataPoint: true,
  resetStorage: () => {
    resetCache();
  },
  recordRule: dataPointDescriptor =>
    cacheFor.keysByType(dataPointDescriptor, CONCEPT_TYPE_TIME)
      .filter(timeKey => !ddfTimeUtils.detectTimeType(dataPointDescriptor.record[timeKey]))
      .map(timeKey => new Issue(DATA_POINT_UNEXPECTED_TIME_VALUE)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData({
          concept: timeKey,
          line: dataPointDescriptor.line + LINE_NUM_INCLUDING_HEADER,
          value: dataPointDescriptor.record[timeKey]
        }))
};
