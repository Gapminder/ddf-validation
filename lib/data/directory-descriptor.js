'use strict';
const _ = require('lodash');
const async = require('async');
const path = require('path');
const DataPackage = require('../data/data-package');
const FileDescriptor = require('./file-descriptor');

const PROCESS_LIMIT = 5;

class DirectoryDescriptor {
  constructor(dir) {
    this.dir = dir;
    this.isEmpty = false;
    this.isDDF = true;
    this.fileDescriptors = [];
    this.errors = [];
  }

  check(onDirectoryDescriptorReady) {
    this.dataPackage = new DataPackage(this.dir);
    this.dataPackage.take(dataPackageObject => {
      if (!this.dataPackage.isValid() || _.isEmpty(this.dataPackage.fileDescriptors)) {
        this.isDDF = false;
        onDirectoryDescriptorReady();
        return;
      }

      this.fileDescriptors =
        dataPackageObject.resources
          .map(ddfResource => this.getFileDescriptor(this.dir, ddfResource));

      const actionsCsv = this.fileDescriptors
        .map(fileDescriptor =>
          onFileChecked =>
            fileDescriptor.csvChecker.check(onFileChecked));
      const actionsForDescriptor = this.fileDescriptors
        .map(fileDescriptor =>
          onFileChecked =>
            fileDescriptor.check(onFileChecked));

      async.parallelLimit(
        actionsCsv.concat(actionsForDescriptor),
        PROCESS_LIMIT,
        err => onDirectoryDescriptorReady(err)
      );
    });
  }

  getFileDescriptor(dir, ddfResource) {
    return new FileDescriptor({
      dir,
      file: ddfResource.path,
      type: this.dataPackage.getType(ddfResource.path),
      headers: ddfResource.headers,
      primaryKey: ddfResource.primaryKey,
      fullPath: path.resolve(dir, ddfResource.path)
    });
  }
}

module.exports = DirectoryDescriptor;
