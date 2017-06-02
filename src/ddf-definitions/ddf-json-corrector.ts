import { first, uniq } from 'lodash';
import { parallelLimit } from 'async';
import { DdfDataSet } from './ddf-data-set';
import { LINE_NUM_INCLUDING_HEADER } from '../ddf-definitions/constants';
import { allRules } from '../ddf-rules';
import { INCORRECT_JSON_FIELD } from '../ddf-rules/registry';
import { readFile, writeFile, backupFile } from '../utils/file';

const jsonExport = require('jsonexport');
const PROCESS_LIMIT = 5;

function correctFile(data, cb) {
  readFile(data.file, (err, content) => {
    if (err) {
      return cb(err);
    }

    data.result
      .filter(issue => issue.path === data.file)
      .forEach(issue => {
        const suggestion = first(issue.suggestions);

        if (suggestion) {
          content[issue.data.line - LINE_NUM_INCLUDING_HEADER][issue.data.column] =
            first(issue.suggestions);
        }
      });

    return cb(null, content);
  });
}

function jsonToCsv(data, onJsonReady) {
  jsonExport(data.content, onJsonReady);
}

export class DdfJsonCorrector {
  public folder: string;
  public jsonContent: any;

  constructor(folder) {
    this.folder = folder;
  }

  correct(onJsonCorrected) {
    const ddfDataSet = new DdfDataSet(this.folder, null);

    ddfDataSet.load(() => {
      const result = allRules[INCORRECT_JSON_FIELD].rule(ddfDataSet);
      const files = uniq(result.map(issue => issue.path));
      const actions = [];

      files.forEach(file => {
        actions.push(cb => {
          correctFile({file, ddfDataSet, result}, (correctFileError, content) => {
            if (correctFileError) {
              return cb(correctFileError);
            }

            this.jsonContent = content;

            return jsonToCsv({file, content, ddfDataSet}, (jsonToCsvError, csv) => {
              if (jsonToCsvError) {
                return cb(jsonToCsvError);
              }

              return cb(null, {file, csv});
            });
          });
        });
      });

      parallelLimit(actions, PROCESS_LIMIT, onJsonCorrected);
    });
  }

  write(fileDescriptors, onFilesSaved) {
    const actions = [];

    fileDescriptors.forEach(fileDescriptor => {
      actions.push(cb => backupFile(fileDescriptor.file,
        () => writeFile(fileDescriptor.file, fileDescriptor.csv, err => cb(err))));
    });

    parallelLimit(actions, PROCESS_LIMIT, onFilesSaved);
  }
}
