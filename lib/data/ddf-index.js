'use strict';
const async = require('async');
const csv = require('csv-stream');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const constants = require('../ddf-definitions/constants');
const FileDescriptor = require('./file-descriptor');

const CSV_OPTIONS = {
  escapeChar: '"',
  enclosedChar: '"'
};

class DdfIndex {
  constructor(ddfPath) {
    this.ddfPath = ddfPath;
    this.content = [];
    this.issues = [];
    this.conceptContent = [];
  }

  read(cb) {
    const csvStream = csv.createStream(CSV_OPTIONS);
    const fileStream = fs.createReadStream(path.resolve(this.ddfPath, 'ddf--index.csv'));

    let indexRecord = {};

    fileStream.on('error', err => cb(err));
    fileStream.on('readable', () => {
      fileStream
        .pipe(csvStream)
        .on('error', err => {
          cb(err);
        })
        .on('data', () => {
          this.content.push(indexRecord);
          indexRecord = {};
        })
        .on('column', (key, value) => {
          if (value) {
            indexRecord[key] = value;
          }
        });
    });
    fileStream.on('end', () => {
      this.fillFileDescriptors();

      cb();
    });
  }

  isConcept(contentRecord) {
    return contentRecord.filter(contentDetail => contentDetail.key === 'concept').length > 0;
  }

  fillFileDescriptors() {
    const gropedContent = _.groupBy(this.content, 'file');

    this.fileDescriptors =
      Object.keys(gropedContent)
        .map(fileName => new FileDescriptor({
          dir: this.ddfPath,
          file: fileName,
          type: this.isConcept(gropedContent[fileName]) ? constants.CONCEPT : null,
          details: [],
          fullPath: path.resolve(this.ddfPath, fileName),
          indexData: gropedContent[fileName]
        })
        );
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
      const csvStream = csv.createStream(CSV_OPTIONS);

      let record = {};

      fileStream.on('error', err => cb(err));
      fileStream.on('readable', () => {
        fileStream
          .pipe(csvStream)
          .on('error', err => {
            cb(err);
          })
          .on('data', () => {
            this.conceptContent.push(record);
            record = {};
          })
          .on('column', (key, value) => {
            if (value) {
              record[key] = value;
            }
          });
      });
      fileStream.on('end', () => {
        cb();
      });
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

  /*eslint max-statements: [2, 20]*/
  fillType(fileDescriptor) {
    if (fileDescriptor.type !== null) {
      return;
    }

    const isDataPoint = _.startsWith(fileDescriptor.file, 'ddf--datapoints');
    const details = this.getDetails(fileDescriptor.headers);

    // todo: do it less heuristic
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
    this.read(err => {
      if (err) {
        this.error = err;
        cb();
        return;
      }

      async.series(
        this.fileDescriptors.map(fileDescriptor => _cb => fileDescriptor.check(_cb)),
        issues => {
          this.issues = issues || [];

          async.series(this.getConceptReading(), _err => {
            if (_err) {
              throw _err;
            }

            this.fileDescriptors.map(fileDescriptor => this.fillType(fileDescriptor));

            cb(this.issues);
          });
        }
      );
    });
  }
}

module.exports = DdfIndex;
