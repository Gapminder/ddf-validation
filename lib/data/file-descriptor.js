'use strict';

const async = require('async');
const _ = require('lodash');
const fs = require('fs');
const fileUtils = require('../utils/file');
const registry = require('../ddf-rules/registry');

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
    this.details = data.details;
    this.fullPath = data.fullPath;
  }

  fillHeaders(cb) {
    fileUtils.getFileLine(this.fullPath, 0, (err, line) => {
      if (err) {
        throw err;
      }

      // todo: do it more correctly
      this.headers = line.split(',');

      cb();
    });
  }

  is(type) {
    if (!_.isArray(type)) {
      return type === this.type;
    }

    return _.includes(type, this.type);
  }

  check(cb) {
    async.parallel(getIssueCases(this), (err, results) => {
      if (err) {
        throw err;
      }

      this.issues = _.compact(results);

      if (_.isEmpty(this.issues)) {
        this.fillHeaders(cb);
        return;
      }

      cb(this.issues);
    });
  }
}

module.exports = FileDescriptor;
