'use strict';

const async = require('async');
const _ = require('lodash');
const fs = require('fs');
const fileUtils = require('../utils/file');
const registry = require('../ddf-rules/registry');
const CsvChecker = require('./csv-checker');

function getIssueCases(fileDescriptor) {
  return [
    cb => {
      fs.stat(fileDescriptor.fullPath, (err, stats) => {
        if (err) {
          cb(null, {
            type: registry.INCORRECT_FILE,
            data: err.message,
            path: fileDescriptor.fullPath
          });
          return;
        }

        if (!stats.isFile()) {
          cb(null, {
            type: registry.INCORRECT_FILE,
            data: `${fileDescriptor.fullPath} is not a file`,
            path: fileDescriptor.fullPath
          });
          return;
        }

        cb();
      });
    }
  ];
}

class FileDescriptor {
  constructor(data) {
    this.dir = data.dir;
    this.file = data.file;
    this.type = data.type;
    this.primaryKey = data.primaryKey;
    this.headers = [];
    this.measures = data.measures;
    this.issues = [];
    this.fullPath = data.fullPath;
    this.csvChecker = new CsvChecker(this.fullPath);
    this.hasFirstLine = false;
  }

  fillHeaders(onHeadersReady) {
    fileUtils.getFileLine(this.fullPath, 0, (err, line) => {
      if (err) {
        onHeadersReady(err);
        return;
      }

      this.headers = line.split(',');

      onHeadersReady();
    });
  }

  is(type) {
    if (!_.isArray(type)) {
      return type === this.type;
    }

    return _.includes(type, this.type);
  }

  check(onFileDescriptorChecked) {
    async.parallel(getIssueCases(this), (err, results) => {
      if (err) {
        throw err;
      }

      fileUtils.getFileLine(this.fullPath, 1, (lineErr, line) => {
        this.hasFirstLine = !lineErr && !!line;
        this.issues = _.compact(results);

        if (_.isEmpty(this.issues)) {
          this.csvChecker.check(() => {
            onFileDescriptorChecked();
          });

          return;
        }

        onFileDescriptorChecked(this.issues);
      });
    });
  }
}

module.exports = FileDescriptor;
