'use strict';

/*eslint max-lines: ["error", 400]*/

const _ = require('lodash');
const fs = require('fs');
const async = require('async');
const path = require('path');
const constants = require('../ddf-definitions/constants');
const fileUtils = require('../utils/file');

const PROCESS_LIMIT = 5;
const CONCEPT_ID = 'concept';
const DATA_PACKAGE_FILE = 'datapackage.json';
const LANG_FOLDER = 'lang';
const CSV_EXTENSION = 'csv';
const REQUIRED_DDF_FILE_PARTS = 2;
const REQUIRED_DATA_POINT_PARTS = 4;

const getConceptType = fileParts => {
  if (fileParts.length === 1 && _.head(fileParts) === 'concepts') {
    return constants.CONCEPT;
  }

  return null;
};
const getEntityType = fileParts => {
  if (fileParts.length > 1 && _.head(fileParts) === 'entities') {
    return constants.ENTITY;
  }

  return null;
};
const getDataPointType = fileParts => {
  const baseCheck = fileParts.length > REQUIRED_DATA_POINT_PARTS && _.head(fileParts) === 'datapoints';
  const indexForBy = _.indexOf(fileParts, 'by');
  const byCheck = indexForBy > 1 && indexForBy < fileParts.length - 1;

  return baseCheck && byCheck ? constants.DATA_POINT : null;
};
const getDdfParts = fileParts => {
  if (fileParts.length >= REQUIRED_DDF_FILE_PARTS && _.head(fileParts) === 'ddf') {
    return _.drop(fileParts);
  }

  return null;
};
const parseDdfFile = (folder, filename) => {
  const partsByPoint = _.split(filename, '.');

  if (partsByPoint.length <= 1 || partsByPoint[1] !== CSV_EXTENSION) {
    return {valid: false};
  }

  const ddfParts = getDdfParts(_.split(_.head(partsByPoint), constants.DDF_SEPARATOR));

  if (!ddfParts) {
    return {valid: false};
  }

  const type = getConceptType(ddfParts) || getEntityType(ddfParts) || getDataPointType(ddfParts);

  if (!type) {
    return {valid: false};
  }

  return {
    valid: true,
    filename,
    name: _.head(partsByPoint),
    fullPath: path.resolve(folder, filename),
    type,
    parts: _.drop(ddfParts)
  };
};
const getTypeByResource = resource => {
  if (_.isArray(resource.schema.primaryKey)) {
    return constants.DATA_POINT;
  }

  if (!_.isArray(resource.schema.primaryKey) && resource.schema.primaryKey === CONCEPT_ID) {
    return constants.CONCEPT;
  }

  return constants.ENTITY;
};

class DataPackage {
  constructor(rootFolder) {
    this.rootFolder = rootFolder;
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];
    this.dataPackage = null;
  }

  getTranslationFileDescriptors(onTranslationsFileDescriptorsReady) {
    fileUtils.readDir(
      path.resolve(this.rootFolder, LANG_FOLDER),
      (errFolders, translationFolders) => {
        if (errFolders) {
          this.warnings.push({
            source: errFolders,
            reason: 'translation folder reading'
          });
          onTranslationsFileDescriptorsReady();
          return;
        }

        const translationsFolderActions = translationFolders
          .map(translationFolder =>
            onTranslationFolderReady => {
              const translationFullFolder =
                path.resolve(this.rootFolder, LANG_FOLDER, translationFolder);

              this.getDdfFileDescriptors(
                translationFullFolder,
                (folderErr, ddfTransFileDescriptors = []) => {
                  const transFileDescriptors = ddfTransFileDescriptors
                    .map(transFileDescriptor => {
                      transFileDescriptor.translation = true;

                      return transFileDescriptor;
                    });

                  onTranslationFolderReady(folderErr, transFileDescriptors);
                }
              );
            });

        async.parallelLimit(translationsFolderActions, PROCESS_LIMIT, (err, translationsData) => {
          onTranslationsFileDescriptorsReady(err, translationFolders, _.flatten(translationsData));
        });
      }
    );
  }

  getDdfFileDescriptors(folder, onDdfFileDescriptorsReady) {
    fileUtils.readDir(folder, (err, files = []) => {
      const ddfFileDescriptors = files
        .map(file => parseDdfFile(folder, file))
        .filter(ddfFile => ddfFile.type);

      onDdfFileDescriptorsReady(err, ddfFileDescriptors);
    });
  }

  fillHeaders(onHeadersReady) {
    const headerGetActions =
      this.fileDescriptors
        .map(fileDescriptor => onHeaderReady => {
          fileUtils.getFileLine(
            fileDescriptor.fullPath,
            0,
            (err, firstLine) => {
              fileDescriptor.headers = err ? [] : _.split((firstLine || '').trim(), ',');
              onHeaderReady();
            }
          );
        });

    async.parallelLimit(headerGetActions, PROCESS_LIMIT, onHeadersReady);
  }

  fillPrimaryKeys() {
    this.fileDescriptors
      .forEach(fileDescriptor => {
        if (fileDescriptor.type === constants.CONCEPT) {
          fileDescriptor.primaryKey = 'concept';
        }

        if (fileDescriptor.type === constants.ENTITY) {
          fileDescriptor.primaryKey = _.last(fileDescriptor.parts);
        }

        if (fileDescriptor.type === constants.DATA_POINT) {
          const ddfDatapointSeparatorPos =
            _.indexOf(fileDescriptor.parts, constants.DDF_DATAPOINT_SEPARATOR);
          const primaryKeyPartsCount =
            fileDescriptor.parts.length - ddfDatapointSeparatorPos - 1;

          fileDescriptor.primaryKey =
            _.takeRight(fileDescriptor.parts, primaryKeyPartsCount);
        }
      });
  }

  getDataPackageObject() {
    const packageName = _.last(_.split(this.rootFolder, path.sep));

    return {
      name: packageName,
      title: packageName,
      description: '',
      version: '0.0.1',
      language: {id: 'en', name: 'English'},
      translations: this.translationFolders
        .map(translation => ({id: translation, name: translation})),
      license: '',
      author: '',
      resources: this.fileDescriptors
        .map(fileDescriptor => ({
          path: fileDescriptor.filename,
          name: fileDescriptor.name,
          schema: {
            fields: (fileDescriptor.headers || [])
              .map(header => ({name: header})),
            primaryKey: fileDescriptor.primaryKey
          }
        }))
    };
  }

  getType(filename) {
    return _.head(
      this.fileDescriptors
        .filter(fileDescriptor => fileDescriptor.filename === filename)
        .map(fileDescriptor => fileDescriptor.type)
    );
  }

  build(onDataPackageReady) {
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];

    this.getDdfFileDescriptors(this.rootFolder, (ddfFileErr, ddfFileDescriptors) => {
      if (ddfFileErr) {
        this.errors.push({
          source: ddfFileErr,
          reason: 'ddf files reading'
        });

        onDataPackageReady();
        return;
      }

      this.getTranslationFileDescriptors(
        (translationsErr, translationFolders) => {
          this.warnings.push({
            source: translationsErr,
            reason: 'translation file reading'
          });

          this.fileDescriptors = _.compact(ddfFileDescriptors);
          this.translationFolders = translationFolders || [];
          this.fillHeaders(headersError => {
            if (headersError) {
              this.errors.push({
                source: headersError,
                reason: 'headers reading'
              });
            }

            this.fillPrimaryKeys();
            this.dataPackage = this.getDataPackageObject();

            onDataPackageReady(this.dataPackage);
          });
        }
      );
    });
  }

  write(onDataPackageFileReady) {
    const dateLabel = new Date().toISOString();
    const filePath = path.resolve(this.rootFolder, `${DATA_PACKAGE_FILE}.${dateLabel}`);

    this.build(() => {
      fileUtils
        .writeFile(
          filePath,
          JSON.stringify(this.dataPackage, null, '\t'),
          err => onDataPackageFileReady(err, filePath)
        );
    });
  }

  read(onDataPackageReady) {
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];

    fs.readFile(
      path.resolve(this.rootFolder, DATA_PACKAGE_FILE),
      'utf8',
      (fileErr, content) => {
        if (fileErr) {
          this.errors.push({
            source: fileErr,
            reason: `${DATA_PACKAGE_FILE} reading`
          });
        }

        try {
          this.dataPackage = JSON.parse(content);
          this.getTranslationFileDescriptors(
            (translationsErr, translationFolders) => {
              this.warnings.push({
                source: translationsErr,
                reason: 'translation file reading'
              });

              this.translationFolders = translationFolders || [];

              onDataPackageReady(this.dataPackage);
            });
        } catch (contentErr) {
          this.errors.push({
            source: contentErr,
            reason: `${DATA_PACKAGE_FILE} parsing`
          });

          onDataPackageReady();
        }
      });
  }

  getResources() {
    return this.dataPackage.resources;
  }

  getTranslations() {
    return this.dataPackage.translations;
  }

  take(onDataPackageReady) {
    const filePath = path.resolve(this.rootFolder, DATA_PACKAGE_FILE);

    fileUtils.fileExists(filePath, (err, isExists) => {
      if (err || !isExists) {
        this.build(dataPackage => onDataPackageReady(dataPackage));
        return;
      }

      this.read(dataPackage => {
        this.fileDescriptors = dataPackage.resources.map(resource => ({
          filename: resource.path,
          name: resource.name,
          fullPath: path.resolve(this.rootFolder, resource.path),
          type: getTypeByResource(resource)
        }));

        this.fillHeaders(headersError => {
          if (headersError) {
            this.errors.push({
              source: headersError,
              reason: 'headers reading'
            });
          }

          onDataPackageReady(dataPackage);
        });
      });
    });
  }

  isValid() {
    return _.isEmpty(this.errors);
  }
}

module.exports = DataPackage;
