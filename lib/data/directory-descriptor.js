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
  const ok = spl.length > MIN_AMOUNT_OF_FILENAME_PARTS && spl[0] === 'ddf' && spl[spl.length - 1] === 'csv';

  return {spl, ok};
}

function isConceptSpecific(checked) {
  return checked.ok && checked.spl[1] === 'concepts';
}

function isEntitySpecific(checked) {
  const MIN_AMOUNT_OF_FILENAME_PARTS = 3;

  return checked.ok &&
    checked.spl.length > MIN_AMOUNT_OF_FILENAME_PARTS &&
    checked.spl[1] === 'entities';
}

function isDataPointSpecific(checked) {
  const MIN_AMOUNT_OF_FILENAME_PARTS = 4;

  return checked.ok &&
    checked.spl.length > MIN_AMOUNT_OF_FILENAME_PARTS &&
    checked.spl[1] === 'datapoints';
}

const CASES = [
  {
    check: filename => {
      const checked = baseFilenameCheck(filename);
      const ok = isConceptSpecific(checked);
      const details = {concepts: ok ? checked.spl.slice(START_INDEX, checked.spl.length - 1) : []};

      return {ok, details};
    },
    type: constants.CONCEPT
  },
  {
    check: filename => {
      const checked = baseFilenameCheck(filename);
      const ok = isEntitySpecific(checked);
      const details = {concepts: ok ? checked.spl.slice(START_INDEX, checked.spl.length - 1) : []};

      return {ok, details};
    },
    type: constants.ENTITY
  },
  {
    check: filename => {
      const checked = baseFilenameCheck(filename);
      const ok = isDataPointSpecific(checked);
      const allConcepts = ok ? checked.spl.slice(START_INDEX, checked.spl.length - 1) : [];
      const posForBy = allConcepts.indexOf('by');
      const details = {
        measures: allConcepts.slice(0, posForBy),
        concepts: allConcepts.slice(posForBy + 1)
      };

      return {ok, details};
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

  mergeFileDescriptors(byFileList, byIndex) {
    if (!byIndex) {
      return byFileList;
    }

    const filesFromIndex =
      byIndex
        .map(fileDescriptor => fileDescriptor.fullPath);
    const expectedFromFileList =
      byFileList
        .filter(fileDescriptor => !_.includes(filesFromIndex, fileDescriptor.fullPath));

    return byIndex.concat(expectedFromFileList);
  }

  check(cb) {
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

      this.ddfIndex = new DdfIndex(this.dir);
      this.ddfIndex.check(() => {
        const byFilesList = files
          .filter(file => file !== 'ddf--index.csv')
          .map(file => this.getFileDescriptors(this.dir, file));
        const byIndex = this.ddfIndex.fileDescriptors;

        this.fileDescriptors = this.mergeFileDescriptors(byFilesList, byIndex);

        cb();
      });
    });
  }

  getFileDescriptors(dir, file) {
    let type = null;
    let details = null;

    for (const currentCase of CASES) {
      const checkResult = currentCase.check(file);

      if (checkResult.ok) {
        details = checkResult.details;
        type = currentCase.type;
        this.isDDF = true;
        break;
      }
    }

    return new FileDescriptor({
      dir,
      file,
      type,
      details,
      fullPath: path.resolve(dir, file)
    });
  }
}

module.exports = DirectoryDescriptor;
