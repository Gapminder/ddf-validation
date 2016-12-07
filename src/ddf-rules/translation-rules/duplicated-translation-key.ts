import {compact, flattenDeep, filter, includes, isEmpty} from 'lodash';
import {DUPLICATED_TRANSLATION_KEY} from '../registry';
import {DATA_POINT} from '../../ddf-definitions/constants';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

export const rule = {
  isTranslation: true,
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor => {
      return directoryDescriptor.fileDescriptors.map(fileDescriptor => {
        return fileDescriptor.getExistingTranslationDescriptors()
          .filter(translationDescriptor => translationDescriptor.type !== DATA_POINT)
          .map(translationDescriptor => {
            const primaryKeys = translationDescriptor.content.map(record =>
              record[translationDescriptor.primaryKey.toString()]);
            const duplications = filter(primaryKeys, (value, index, iteratee) =>
              includes(iteratee, value, index + 1));

            let issue = null;

            if (!isEmpty(duplications)) {
              issue = new Issue(DUPLICATED_TRANSLATION_KEY)
                .setPath(translationDescriptor.fullPath)
                .setData(duplications);
            }

            return issue;
          });
      });
    })
  ))
};
