'use strict';

const _ = require('lodash');
const async = require('async');
const json2csv = require('json2csv');
const DdfDataSet = require('./ddf-data-set');
const generalDdfRules = require('../ddf-rules/general-rules');
const rulesRegistry = require('../ddf-rules/registry');
const fileUtils = require('../utils/file');

const LINE_NUM_INCLUDING_HEADER = 2;

function correctFile(data, cb) {
  fileUtils.readFile(data.file, (err, content) => {
    if (err) {
      return cb(err);
    }

    data.warnings.forEach(issue => {
      content[issue.data.line - LINE_NUM_INCLUDING_HEADER][issue.data.column] =
        _.first(issue.suggestions);
    });

    return cb(null, content);
  });
}

function jsonToCsv(data, cb) {
  const expectedDetail =
    data.concept.details
      .find(detail => detail.fileDescriptor.fullPath === data.file);

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
      const result = generalDdfRules[rulesRegistry.INCORRECT_JSON_FIELD](ddfDataSet);
      const warnings = result.filter(issue => issue.isWarning);
      const files = _.uniq(warnings.map(issue => issue.path));
      const concept = ddfDataSet.getConcept();
      const actions = [];

      files.forEach(file => {
        actions.push(cb => {
          correctFile({file, concept, warnings}, (correctFileError, content) => {
            if (correctFileError) {
              return cb(correctFileError);
            }

            return jsonToCsv({file, content, concept}, (jsonToCsvError, csv) => {
              if (jsonToCsvError) {
                return cb(jsonToCsvError);
              }

              return cb(null, {file, csv});
            });
          });
        });
      });

      async.parallel(actions, (err, correctedJsonByFile) => {
        onJsonCorrected(err, correctedJsonByFile);
      });
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

    async.parallel(actions, err => onFilesSaved(err));
  }
}

module.exports = DdfJsonCorrector;
