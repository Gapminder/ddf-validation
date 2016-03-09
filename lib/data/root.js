'use strict';

const async = require('async');
const fu = require('../utils/file');
const DirectoryDescriptor = require('./directory-descriptor');

class DDFRoot {
  constructor(path) {
    this.path = path;
    this.errors = [];
    this.directoryDescriptors = [];
  }

  getChecks(dirs) {
    const actions = [];

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
        cb();
        return;
      }

      async.parallel(this.getChecks(dirs), (_err, directoryDescriptors) => {
        this.directoryDescriptors = directoryDescriptors;
        if (_err) {
          this.errors.push(_err);
        }

        cb();
      });
    });
  }

  getDdfDirectoriesDescriptors() {
    return this.directoryDescriptors.filter(desc => desc.isDDF);
  }

  getNonDdfDirectoriesDescriptors() {
    return this.directoryDescriptors.filter(desc => !desc.isDDF);
  }
}

module.exports = DDFRoot;
