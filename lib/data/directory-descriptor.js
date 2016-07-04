'use strict';
const _ = require('lodash');
const path = require('path');
const fu = require('../utils/file');
const constants = require('../ddf-definitions/constants');
const DdfIndex = require('./ddf-index');
const FileDescriptor = require('./file-descriptor');

const START_INDEX = 2;

function baseFilenameCheck(filename) {
  const spl = filename.split(/--|\.{1}/);
  const MIN_AMOUNT_OF_FILENAME_PARTS = 2;
  const matched = spl.length > MIN_AMOUNT_OF_FILENAME_PARTS && spl[0] === 'ddf' && spl[spl.length - 1] === 'csv';

  return {spl, matched};
}

function isConceptSpecific(caseCheckingResult) {
  return caseCheckingResult.matched && caseCheckingResult.spl[1] === 'concepts';
}

function isEntitySpecific(caseCheckingResult) {
  const MIN_AMOUNT_OF_FILENAME_PARTS = 3;

  return caseCheckingResult.matched &&
    caseCheckingResult.spl.length > MIN_AMOUNT_OF_FILENAME_PARTS &&
    caseCheckingResult.spl[1] === 'entities';
}

function isDataPointSpecific(caseCheckingResult) {
  const MIN_AMOUNT_OF_FILENAME_PARTS = 4;

  return caseCheckingResult.matched &&
    caseCheckingResult.spl.length > MIN_AMOUNT_OF_FILENAME_PARTS &&
    caseCheckingResult.spl[1] === 'datapoints';
}

const CASES = [
  {
    check: filename => {
      const headersFromFilename = baseFilenameCheck(filename);
      const matched = isConceptSpecific(headersFromFilename);
      const details = {concepts: ['concept', 'concept_type']};

      return {matched, details, headers: []};
    },
    type: constants.CONCEPT
  },
  {
    check: filename => {
      const headersFromFilename = baseFilenameCheck(filename);
      const matched = isEntitySpecific(headersFromFilename);
      const details =
      {concepts: matched ? headersFromFilename.spl.slice(START_INDEX, headersFromFilename.spl.length - 1) : []};

      return {matched, details, headers: headersFromFilename};
    },
    type: constants.ENTITY
  },
  {
    check: filename => {
      const headersFromFilename = baseFilenameCheck(filename);
      const matched = isDataPointSpecific(headersFromFilename);
      const allConcepts =
        matched ? headersFromFilename.spl.slice(START_INDEX, headersFromFilename.spl.length - 1) : [];
      const posForBy = allConcepts.indexOf('by');
      const details = {
        measures: allConcepts.slice(0, posForBy),
        concepts: allConcepts.slice(posForBy + 1)
      };

      return {matched, details, headers: headersFromFilename};
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

      if (currentCaseCheckingResult.matched) {
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
