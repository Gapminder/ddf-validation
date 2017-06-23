import { includes } from 'lodash';
import { DATA_POINT_UNEXPECTED_ENTITY_VALUE } from '../registry';
import { LINE_NUM_INCLUDING_HEADER } from '../../ddf-definitions/constants';
import { Issue } from '../issue';
import { cacheFor, resetCache } from './shared';

export const rule = {
  isDataPoint: true,
  resetStorage: () => {
    resetCache();
  },
  recordRule: dataPointDescriptor => {
    const entities = cacheFor.getEntitiesByRecord(dataPointDescriptor);
    const entityValueHash = cacheFor.getEntityValueHash(dataPointDescriptor);
    const issues = [];

    for (let entity of entities) {
      const entityKey = `${entity}@${dataPointDescriptor.record[entity]}`;

      if (!includes(entityValueHash[entityKey], entity)) {
        const issue = new Issue(DATA_POINT_UNEXPECTED_ENTITY_VALUE)
          .setPath(dataPointDescriptor.fileDescriptor.fullPath)
          .setData({
            concept: entity,
            line: dataPointDescriptor.line + LINE_NUM_INCLUDING_HEADER,
            value: dataPointDescriptor.record[entity]
          });

        issues.push(issue);
      }
    }

    return issues;
  }
};
