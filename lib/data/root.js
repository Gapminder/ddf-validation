'use strict';

const _ = require('lodash');
const pathModule = require('path');
const async = require('async');
const fu = require('../utils/file');
const DirectoryDescriptor = require('./directory-descriptor');

function isExcludedDirectory(currentDirectory, excludedDirectory) {
  return (_
        .split(currentDirectory, pathModule.sep)
        .filter(dir => dir === excludedDirectory)
    ).length > 0;
}

function isHiddenDirectory(currentDirectory, settings) {
  if (settings.isCheckHidden) {
    return false;
  }

  return (_
        .split(currentDirectory, pathModule.sep)
        .filter(dir => dir !== '.' && _.startsWith(dir, '.') && !_.startsWith(dir, '..'))
    ).length > 0;
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
    const defaultExcludes = ['etl'];

    dirs.concat(this.path).forEach(dir => {
      const isNotExcludedDirectory = !isHiddenDirectory(dir, this.settings) &&
        _.chain(defaultExcludes.concat(this.settings.excludeDirs))
          .map(excludedDir => isExcludedDirectory(dir, excludedDir))
          .compact()
          .isEmpty()
          .value();

      if (isNotExcludedDirectory) {
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
