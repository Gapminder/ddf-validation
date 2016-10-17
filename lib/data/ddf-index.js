'use strict';
const async = require('async');
const csv = require('fast-csv');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const constants = require('../ddf-definitions/constants');
const FileDescriptor = require('./file-descriptor');
const CsvChecker = require('./csv-checker');

class DdfIndex {
  constructor(ddfPath, settings) {
    this.ddfPath = ddfPath;
    this.settings = settings;
    this.indexPath = path.resolve(ddfPath, 'ddf--index.csv');
    this.csvChecker = new CsvChecker(this.indexPath);
    this.content = [];
    this.issues = [];
    this.conceptContent = [];
    this.exists = !settings.indexlessMode;
  }

  read(cb) {
    fs.exists(this.indexPath, exists => {
      if (!exists) {
        this.exists = false;
        cb();
        return;
      }

      const fileStream = fs.createReadStream(this.indexPath);

      fileStream.on('error', error => {
        this.exists = false;

        cb(error);
      });

      csv
        .fromStream(fileStream, {headers: true})
        .on('data', indexRecord => this.content.push(indexRecord))
        .on('end', () => {
          this.fillFileDescriptors();

          cb();
        });
    });
  }

  isConcept(contentRecord) {
    return contentRecord
        .filter(contentDetail => contentDetail.key === 'concept').length > 0;
  }

  fillFileDescriptors() {
    const gropedContent = _.groupBy(this.content, 'file');

    this.fileDescriptors = Object.keys(gropedContent)
      .map(fileName => new FileDescriptor({
        dir: this.ddfPath,
        file: fileName,
        type: this.isConcept(gropedContent[fileName]) ? constants.CONCEPT : null,
        details: [],
        fullPath: path.resolve(this.ddfPath, fileName),
        indexData: gropedContent[fileName]
      }));
  }

  getConceptFileNames() {
    return this.fileDescriptors
      .filter(fileDescriptor => fileDescriptor.type === constants.CONCEPT)
      .filter(fileDescriptor => _.isEmpty(fileDescriptor.issues))
      .map(fileDescriptor => fileDescriptor.fullPath);
  }

  getConceptReading() {
    return this.getConceptFileNames().map(fileName => cb => {
      const fileStream = fs.createReadStream(fileName);

      csv
        .fromStream(fileStream, {headers: true})
        .on('data', record => this.conceptContent.push(record))
        .on('end', () => cb());
    });
  }

  getDetails(headers) {
    const conceptTypeHash = {};

    this.conceptContent.forEach(concept => {
      conceptTypeHash[concept.concept] = concept.concept_type;
    });

    return {
      measures: headers.filter(header => conceptTypeHash[header] === 'measure'),
      concepts: headers.filter(header => conceptTypeHash[header] !== 'measure')
    };
  }

  fillType(fileDescriptor) {
    if (fileDescriptor.type !== null || _.isEmpty(fileDescriptor.headers)) {
      return;
    }

    const details = this.getDetails(fileDescriptor.headers);
    const isDataPoint = _.chain(fileDescriptor.indexData)
        .filter(indexDataRecord => _.includes(indexDataRecord.key, ','))
        .compact()
        .value()
        .length > 0;

    if (isDataPoint) {
      fileDescriptor.type = constants.DATA_POINT;
      fileDescriptor.details = details;
    }

    if (!isDataPoint) {
      fileDescriptor.type = constants.ENTITY;
      fileDescriptor.details.concepts = details.concepts;
    }
  }

  check(cb) {
    this.csvChecker.check(() => {
      this.read(err => {
        if (err || !this.exists) {
          this.error = err;
          cb();
          return;
        }

        async.series(
          this.fileDescriptors
            .map(fileDescriptor => onFileChecked => fileDescriptor.check(onFileChecked)),
          issues => {
            this.issues = issues || [];

            async.series(this.getConceptReading(), _err => {
              if (_err) {
                throw _err;
              }

              this.fileDescriptors.map(fileDescriptor => this.fillType(fileDescriptor));

              cb(this.issues);
            });
          });
      });
    });
  }
}

module.exports = DdfIndex;
