const _ = require('lodash');
const path = require('path');
const measureValuesSchema = require('../ddf-schema/ddf-measure-values.schema');
const rxReadCsv = require('../utils/rx-read-csv-file-to-json');

module.exports = folderPath => {
  const filesInFolder$ = require('../utils/rx-read-files-in-folder')(folderPath)
    .map(fileName => path.basename(fileName));
  // filter measure values files
  const measureValuesFiles$ = filesInFolder$
    .filter(fileName => measureValuesSchema.fileExp.test(fileName));

  return measureValuesFiles$
    .first()
    .mergeMap(fileName => {
      const fullFileName = path.join(folderPath, fileName);
      const file$ = rxReadCsv(fullFileName);
      const rows$ = file$.first().mergeMapTo(file$, _.zipObject);

      return rows$.map(data => {
        return {
          data, fileName, folderPath
        };
      });
    });
};
