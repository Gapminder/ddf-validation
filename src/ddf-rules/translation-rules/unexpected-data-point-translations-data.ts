import {isEmpty} from 'lodash';
import {UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA} from '../registry';
import {Issue} from '../issue';

export const rule = {
  isTranslation: true,
  recordRule: dataPointDescriptor => {
    const emptyDataUnderPrimaryKey = dataPointDescriptor.fileDescriptor.primaryKey.filter(primaryKeyPart =>
      !dataPointDescriptor.record[primaryKeyPart]);

    if (!isEmpty(emptyDataUnderPrimaryKey)) {
      return new Issue(UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA)
        .setPath(dataPointDescriptor.fileDescriptor.fullPath)
        .setData({
          record: dataPointDescriptor.record,
          primaryKey: dataPointDescriptor.fileDescriptor.primaryKey
        });
    }

    return null;
  }
};
