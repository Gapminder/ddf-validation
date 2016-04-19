'use strict';

const json2csv = require('json2csv');
const path = require('path');
const fs = require('fs');
const fileUtils = require('../utils/file');
const DdfData = require('./ddf-data');
const indexFileName = 'ddf--index.csv';
const indexBackupFileName = 'ddf--index.backup.csv';

class DdfIndexGenerator {
  constructor(folder) {
    this.folder = folder;
    this.indexFile = path.resolve(this.folder, indexFileName);
  }

  backupCurrentIndex(cb) {
    const indexBackupFile = path.resolve(this.folder, indexBackupFileName);

    fs.stat(this.indexFile, (statErr, stats) => {
      if (statErr) {
        cb();
        return;
      }

      if (stats.isFile()) {
        fs.rename(this.indexFile, indexBackupFile, fileErr => {
          if (fileErr) {
            throw fileErr;
          }

          cb();
        });
      }
    });
  }

  writeIndex() {
    this.backupCurrentIndex(() => {
      this.getCsv((err, csvContent) => {
        if (err) {
          throw err;
        }

        fileUtils.writeFile(this.indexFile, csvContent, fileErr => {
          if (fileErr) {
            throw fileErr;
          }
        });
      });
    });
  }

  getConceptsIndex() {
    const content = [];

    this.ddfData.getConcept().details.forEach(detail => {
      detail.header.forEach(headerRecord => {
        if (headerRecord !== 'concept') {
          content.push({
            key: 'concept',
            value: headerRecord,
            file: detail.fileDescriptor.file
          });
        }
      });
    });

    return content;
  }

  getEntitiesIndex() {
    const content = [];

    this.ddfData.getEntity().details.forEach(detail => {
      const key = detail.fileDescriptor.details.concepts.length === 1
        ? detail.fileDescriptor.details.concepts[0] : detail.fileDescriptor.headers[0];

      detail.header.forEach(value => {
        if (key !== value) {
          content.push({
            key,
            value,
            file: detail.fileDescriptor.file
          });
        }
      });
    });

    return content;
  }

  getDataPointsIndex() {
    const content = [];

    this.ddfData.getDataPoint().details.forEach(detail => {
      content.push({
        key: detail.fileDescriptor.details.concepts.join(','),
        value: detail.fileDescriptor.details.measures[0],
        file: detail.fileDescriptor.file
      });
    });

    return content;
  }

  getJson(cb) {
    this.ddfData = new DdfData(this.folder);

    this.ddfData.load(() => {
      const content =
        this.getConceptsIndex()
          .concat(this.getEntitiesIndex())
          .concat(this.getDataPointsIndex());

      this.ddfData.dismiss(() => {
        cb(content);
      });
    });
  }

  getCsv(cb) {
    this.getJson(jsonContent => {
      json2csv({data: jsonContent, fields: ['key', 'value', 'file']}, (err, csv) => {
        cb(err, csv);
      });
    });
  }
}

module.exports = DdfIndexGenerator;
