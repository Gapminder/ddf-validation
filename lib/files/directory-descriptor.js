'use strict';
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
        return cb();
      }

      if (files.length <= 0) {
        this.isEmpty = true;
        return cb();
      }

      this.fileDescriptors = files
        .map(file => this._getDDFFileDescriptorDetails(this.dir, file));

      cb();
    });
  }

  _getDDFFileDescriptorDetails(dir, file) {
    let type = null;
    for (let i = 0; i < CASES.length; i++) {
      if (CASES[i].pattern.exec(file)) {
        type = CASES[i].type;
        this.isDDF = true;
        break;
      }
    }

    return {dir, file, type};
  }
}

module.exports = DirectoryDescriptor;
