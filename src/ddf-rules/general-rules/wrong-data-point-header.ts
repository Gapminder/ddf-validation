import {compact, intersection, isEmpty} from 'lodash';
import {WRONG_DATA_POINT_HEADER} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

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

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => compact(
    ddfDataSet.getDataPoint().fileDescriptors
      .map(dataPointFileDescriptor => {
        const allStringConcepts = cacheFor.keysByType(ddfDataSet, 'string');
        const wrongConcepts = intersection(allStringConcepts, dataPointFileDescriptor.headers);

        if (isEmpty(wrongConcepts)) {
          return null;
        }

        return new Issue(WRONG_DATA_POINT_HEADER)
          .setPath(dataPointFileDescriptor.fullPath)
          .setData({wrongConcepts, reason: 'string type based concepts'});
      })
  )
};
