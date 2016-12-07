import {isArray, compact, flattenDeep, intersection} from 'lodash';
import {UNEXPECTED_TRANSLATION_HEADER} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

function getAsArray(value) {
  return isArray(value) ? value : [value];
}

export const rule: any = {
  isTranslation: true,
  rule: (ddfDataSet: DdfDataSet) => compact(flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors.map(directoryDescriptor =>
      directoryDescriptor.fileDescriptors.map(fileDescriptor =>
        fileDescriptor.getExistingTranslationDescriptors().map(translationDescriptor => {
          const headersDiff = intersection(fileDescriptor.headers, translationDescriptor.headers);
          const primaryKey = getAsArray(fileDescriptor.primaryKey);
          const primaryKeyDiff = intersection(primaryKey, translationDescriptor.headers);
          const issues = [];
          const pushIssue = issueData => {
            issues.push(new Issue(UNEXPECTED_TRANSLATION_HEADER)
              .setPath(translationDescriptor.fullPath)
              .setData(issueData));
          };

          if (translationDescriptor.headers.length > headersDiff.length || headersDiff.length === 0) {
            pushIssue({
              reason: 'extra data in translation',
              ddfFileHeaders: fileDescriptor.headers,
              translationHeaders: translationDescriptor.headers
            });
          }

          if (primaryKeyDiff.length < primaryKey.length) {
            pushIssue({
              reason: 'non consistent primary key',
              primaryKey: fileDescriptor.primaryKey,
              translationHeaders: translationDescriptor.headers
            });
          }

          return issues;
        })
      )
    )
  ))
};
