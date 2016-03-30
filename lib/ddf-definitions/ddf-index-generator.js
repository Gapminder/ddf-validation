'use strict';

const json2csv = require('json2csv');
const DdfData = require('./ddf-data');

class DdfIndexGenerator {
  constructor(folder) {
    this.folder = folder;
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
      detail.header.forEach(headerRecord => {
        if (detail.fileDescriptor.details.concepts[0] !== headerRecord) {
          content.push({
            key: detail.fileDescriptor.details.concepts[0],
            value: headerRecord,
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
