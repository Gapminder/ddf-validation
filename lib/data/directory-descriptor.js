'use strict';
const lodash = require('lodash');
const fu = require('../utils/file');

const CONCEPTS = Symbol('concept');
const ENTRIES = Symbol('entry');
const MEASURES = Symbol('measure');
const DATA_POINTS = Symbol('data point');
const CASES = [
  {
    pattern: /^ddf--concepts\.csv$/,
    type: CONCEPTS
  },
  {
    pattern: /^ddf--entries\.csv$/,
    type: ENTRIES
  },
  {
    pattern: /^ddf--measures\.csv$/,
    type: MEASURES
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

  static get CONCEPTS() {
    return CONCEPTS;
  }

  static get ENTRIES() {
    return ENTRIES;
  }

  static get MEASURES() {
    return MEASURES;
  }

  static get DATA_POINTS() {
    return DATA_POINTS;
  }

  check(cb) {
    fu.readDir(this.dir, (err, files) => {
      if (err) {
        this.errors.push(err);
        cb();
        return;
      }

      this.isEmpty = lodash.isEmpty(files);
      if (this.isEmpty) {
        cb();
        return;
      }

      this.fileDescriptors = files
        .map(file => this.getDDFFileDescriptorDetails(this.dir, file));

      cb();
    });
  }

  getDDFFileDescriptorDetails(dir, file) {
    let type = null;

    for (const currentCase of CASES) {
      if (currentCase.pattern.exec(file)) {
        type = currentCase.type;
        this.isDDF = true;
        break;
      }
    }

    return {dir, file, type};
  }
}

module.exports = DirectoryDescriptor;
