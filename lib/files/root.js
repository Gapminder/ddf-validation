'use strict';

const async = require('async');
const fu = require('../utils/file');
const DirectoryDescriptor = require('../files/directory-descriptor');

class DDFRoot {
  constructor(path) {
    this.path = path;
    this.errors = [];
    this.directoryDescriptors = [];
  }

  getChecks(dirs) {
    let actions = [];

    dirs.concat(this.path).forEach(dir => {
      actions.push(_cb => {
        const directoryDescriptor = new DirectoryDescriptor(dir);
        directoryDescriptor.check(() => _cb(null, directoryDescriptor));
      });
    });

    return actions;
  }

  check(cb) {
    fu.walkDir(this.path, (err, dirs) => {
      if (err) {
        this.errors.push(err);
        return cb();
      }

      async.parallel(this.getChecks(dirs), (err, directoryDescriptors) => {
        this.directoryDescriptors = directoryDescriptors;
        cb();
      });
    });
  }

  getDdfDirectoriesDescriptors() {
    return this.directoryDescriptors.filter(d => d.isDDF);
  }

  getNonDdfDirectoriesDescriptors() {
    return this.directoryDescriptors.filter(d => !d.isDDF);
  }
}

module.exports = DDFRoot;
