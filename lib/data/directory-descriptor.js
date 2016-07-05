'use strict';
const _ = require('lodash');
const path = require('path');
const fu = require('../utils/file');
const constants = require('../ddf-definitions/constants');
const DdfIndex = require('./ddf-index');
const FileDescriptor = require('./file-descriptor');

function baseFilenameCheck(filename) {
  const splitted = filename.split(/--|\.{1}/);
  const MIN_AMOUNT_OF_FILENAME_PARTS = 2;
  const startsFromDdf = () => _.head(splitted) === 'ddf';
  const endsToCsv = () => _.last(splitted) === 'csv';
  const looksLikeDDF = splitted.length > MIN_AMOUNT_OF_FILENAME_PARTS && startsFromDdf() && endsToCsv();

  return {splitted: _.take(_.tail(splitted), splitted.length - MIN_AMOUNT_OF_FILENAME_PARTS), looksLikeDDF};
}

function isConceptSpecific(caseCheckingResult) {
  return caseCheckingResult.looksLikeDDF && _.head(caseCheckingResult.splitted) === 'concepts';
}

function isEntitySpecific(caseCheckingResult) {
  return caseCheckingResult.looksLikeDDF &&
    caseCheckingResult.splitted.length > 1 &&
    _.head(caseCheckingResult.splitted) === 'entities';
}

function isDataPointSpecific(caseCheckingResult) {
  const MIN_AMOUNT_OF_FILENAME_PARTS = 2;

  return caseCheckingResult.looksLikeDDF &&
    caseCheckingResult.splitted.length > MIN_AMOUNT_OF_FILENAME_PARTS &&
    _.head(caseCheckingResult.splitted) === 'datapoints';
}

const CASES = [
  {
    check: filename => {
      const headersFromFilename = baseFilenameCheck(filename);
      const looksLikeDDF = isConceptSpecific(headersFromFilename);
      const details = {concepts: ['concept', 'concept_type']};

      return {looksLikeDDF, details, headers: []};
    },
    type: constants.CONCEPT
  },
  {
    check: filename => {
      const headersFromFilename = baseFilenameCheck(filename);
      const looksLikeDDF = isEntitySpecific(headersFromFilename);
      const details = {concepts: looksLikeDDF ? _.tail(headersFromFilename.splitted) : []};

      return {looksLikeDDF, details, headers: headersFromFilename};
    },
    type: constants.ENTITY
  },
  {
    check: filename => {
      const headersFromFilename = baseFilenameCheck(filename);
      const looksLikeDDF = isDataPointSpecific(headersFromFilename);
      const allConcepts = looksLikeDDF ? _.tail(headersFromFilename.splitted) : [];
      const posForBy = allConcepts.indexOf('by');
      const details = {
        measures: allConcepts.slice(0, posForBy),
        concepts: allConcepts.slice(posForBy + 1)
      };

      return {looksLikeDDF, details, headers: headersFromFilename};
    },
    type: constants.DATA_POINT
  }
];

class DirectoryDescriptor {
  constructor(dir) {
    this.dir = dir;
    this.isEmpty = false;
    this.isDDF = false;
    this.fileDescriptors = [];
    this.errors = [];
  }

  check(settings, cb) {
    fu.readDir(this.dir, (err, files) => {
      if (err) {
        this.errors.push(err);
        cb();
        return;
      }

      this.isEmpty = _.isEmpty(files);
      if (this.isEmpty) {
        cb();
        return;
      }

      this.ddfIndex = new DdfIndex(this.dir, settings);
      this.ddfIndex.check(() => {
        const byFilesList = files
          .filter(file => file !== 'ddf--index.csv')
          .map(file => this.getFileDescriptor(this.dir, file));
        const byIndex = this.ddfIndex.fileDescriptors;

        this.fileDescriptors = this.ddfIndex.exists ? byIndex : byFilesList;

        cb();
      });
    });
  }

  getFileDescriptor(dir, file) {
    let checkResult = {details: null, type: null};

    for (const currentCase of CASES) {
      const currentCaseCheckingResult = currentCase.check(file);

      if (currentCaseCheckingResult.looksLikeDDF) {
        checkResult = currentCaseCheckingResult;
        checkResult.type = currentCase.type;
        this.isDDF = true;
        break;
      }
    }

    return new FileDescriptor({
      dir,
      file,
      type: checkResult.type,
      details: checkResult.details,
      headers: checkResult.headers,
      fullPath: path.resolve(dir, file)
    });
  }
}

module.exports = DirectoryDescriptor;
