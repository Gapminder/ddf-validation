'use strict';

const _ = require('lodash');
const async = require('async');
const json2csv = require('json2csv');
const DdfDataSet = require('./ddf-data-set');
const constants = require('../ddf-definitions/constants');
const generalDdfRules = require('../ddf-rules/general-rules');
const rulesRegistry = require('../ddf-rules/registry');
const fileUtils = require('../utils/file');

function correctFile(data, cb) {
  fileUtils.readFile(data.file, (err, content) => {
    if (err) {
      return cb(err);
    }

    data.result
      .filter(issue => issue.path === data.file)
      .forEach(issue => {
        const suggestion = _.first(issue.suggestions);

        if (suggestion) {
          content[issue.data.line - constants.LINE_NUM_INCLUDING_HEADER][issue.data.column] =
            _.first(issue.suggestions);
        }
      });

    return cb(null, content);
  });
}

function jsonToCsv(data, cb) {
  const concept = data.ddfDataSet.getConcept();
  const entity = data.ddfDataSet.getEntity();
  const expectedDetail =
    concept.fileDescriptors.find(fileDescriptor => fileDescriptor.fullPath === data.file) ||
    entity.fileDescriptors.find(fileDescriptor => fileDescriptor.fullPath === data.file);

  json2csv({data: data.content, fields: expectedDetail.header}, (err, csv) => {
    cb(err, csv);
  });
}

class DdfJsonCorrector {
  constructor(folder) {
    this.folder = folder;
  }

  correct(onJsonCorrected) {
    const ddfDataSet = new DdfDataSet(this.folder);

    ddfDataSet.load(() => {
      const result = generalDdfRules[rulesRegistry.INCORRECT_JSON_FIELD].rule(ddfDataSet);
      const files = _.uniq(result.map(issue => issue.path));
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

      async.parallel(actions, onJsonCorrected);
    });
  }

  write(fileDescriptors, onFilesSaved) {
    const actions = [];

    fileDescriptors.forEach(fileDescriptor => {
      actions.push(cb =>
        fileUtils
          .backupFile(fileDescriptor.file, () => fileUtils
            .writeFile(fileDescriptor.file, fileDescriptor.csv, err => cb(err))));
    });

    async.parallel(actions, onFilesSaved);
  }
}

module.exports = DdfJsonCorrector;
