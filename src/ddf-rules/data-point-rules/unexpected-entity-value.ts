import {includes} from 'lodash';
import {DATA_POINT_UNEXPECTED_ENTITY_VALUE} from '../registry';
import {LINE_NUM_INCLUDING_HEADER} from '../../ddf-definitions/constants';
import {Issue} from '../issue';
import {cacheFor} from './shared';

export const rule = {
  isDataPoint: true,
  recordRule: dataPointDescriptor => {
    const entityValueHash = cacheFor.entityValueHash(dataPointDescriptor);

    return Object.keys(entityValueHash)
      .filter(entityKey =>
        !includes(entityValueHash[entityKey], dataPointDescriptor.record[entityKey]))
      .map(entityKey =>
        new Issue(DATA_POINT_UNEXPECTED_ENTITY_VALUE)
          .setPath(dataPointDescriptor.fileDescriptor.fullPath)
          .setData({
            concept: entityKey,
            line: dataPointDescriptor.line + LINE_NUM_INCLUDING_HEADER,
            value: dataPointDescriptor.record[entityKey]
          }));
  }
};
