import { concat, compact, flattenDeep, isEmpty } from 'lodash';
import { UNEXPECTED_TRANSLATIONS_DATA } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';

export const rule = {
  isTranslation: true,
  rule: (ddfDataSet: DdfDataSet) => {
    const getDataConsistencyIssues = (primaryKey, transFileDescriptor) => transFileDescriptor.content
      .filter(transRecord => !transRecord[primaryKey])
      .map(transRecord => ({transRecord, primaryKey, transFileDescriptor}));
    const fileDescriptorsToCheck =
      concat(ddfDataSet.getConcept().fileDescriptors, ddfDataSet.getEntity().fileDescriptors);
    const dataConsistencyIssuesSources = compact(flattenDeep(
      fileDescriptorsToCheck.map(fileDescriptor =>
        fileDescriptor.transFileDescriptors
          .filter(transFileDescriptor => isEmpty(transFileDescriptor.issues))
          .map(transFileDescriptor =>
            getDataConsistencyIssues(fileDescriptor.primaryKey, transFileDescriptor)
          )
          .filter(issueSource => !!issueSource)
      )
    ));

    return dataConsistencyIssuesSources.map(issueSource => new Issue(UNEXPECTED_TRANSLATIONS_DATA)
      .setPath(issueSource.transFileDescriptor.fullPath)
      .setData({
        record: issueSource.transRecord,
        primaryKey: issueSource.primaryKey
      })
    );
  }
};
