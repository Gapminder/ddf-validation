'use strict';
const _ = require('lodash');
const async = require('async');
const path = require('path');
const constants = require('../ddf-definitions/constants');
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

  getTranslations(onTranslationsReady) {
    if (_.isEmpty(this.dataPackage.getTranslations()) || !_.isArray(this.dataPackage.getTranslations())) {
      onTranslationsReady();
      return;
    }

    const translationsIds = this.dataPackage.getTranslations().map(translation => translation.id);

    this.fileDescriptors.forEach(fileDescriptor => {
      const translationFolder = path.resolve(this.dir, constants.TRNSLATIONS_FOLDER);

      fileDescriptor.transFileDescriptors = translationsIds
        .map(translationsId =>
          new FileDescriptor({
            dir: path.resolve(translationFolder, translationsId),
            file: fileDescriptor.file,
            type: fileDescriptor.type,
            fullPath: path.resolve(translationFolder, translationsId, fileDescriptor.file)
          }));
    });

    const transFileActions = this.fileDescriptors
      .map(fileDescriptor =>
        onTransFileReady =>
          fileDescriptor.checkTranslations(onTransFileReady));

    async.parallelLimit(transFileActions, PROCESS_LIMIT, err => {
      onTranslationsReady(err);
    });
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
        checkErr => {
          if (checkErr) {
            onDirectoryDescriptorReady(checkErr);
            return;
          }

          this.getTranslations(translationErr => {
            onDirectoryDescriptorReady(translationErr);
          });
        }
      );
    });
  }

  getFileDescriptor(dir, ddfResource) {
    return new FileDescriptor({
      dir,
      file: ddfResource.path,
      type: this.dataPackage.getType(ddfResource.path),
      headers: ddfResource.schema.fields,
      primaryKey: ddfResource.schema.primaryKey,
      fullPath: path.resolve(dir, ddfResource.path)
    });
  }
}

module.exports = DirectoryDescriptor;
