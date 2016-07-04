'use strict';

const _ = require('lodash');
const pathModule = require('path');
const async = require('async');
const fu = require('../utils/file');
const DirectoryDescriptor = require('./directory-descriptor');

function isExcludedDirectory(currentDirectory, excludedDirectory) {
  const EXCLUDED_DIRECTORY_PATTERN = new RegExp(`${pathModule.sep}${excludedDirectory}${pathModule.sep}?`);

  return EXCLUDED_DIRECTORY_PATTERN.test(currentDirectory);
}

function isHiddenDirectory(currentDirectory) {
  const HIDDEN_DIRECTORY_PATTERN = new RegExp(`${pathModule.sep}\\.[^.${pathModule.sep}]`);

  return HIDDEN_DIRECTORY_PATTERN.test(currentDirectory);
}

class DDFRoot {
  constructor(path, settings) {
    this.path = path;
    this.settings = settings || {};
    this.settings.excludeDirs = this.settings.excludeDirs || [];
    this.errors = [];
    this.directoryDescriptors = [];
  }

  getChecks(dirs) {
    const actions = [];

    dirs.concat(this.path).forEach(dir => {
      const isAllowed = !isHiddenDirectory(dir) &&
        _.chain(this.settings.excludeDirs)
          .map(excludedDir => isExcludedDirectory(dir, excludedDir))
          .compact()
          .isEmpty();

      if (isAllowed) {
        actions.push(_cb => {
          const directoryDescriptor = new DirectoryDescriptor(dir);

          directoryDescriptor.check(this.settings, () => _cb(null, directoryDescriptor));
        });
      }
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
