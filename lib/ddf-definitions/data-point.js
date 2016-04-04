'use strict';

const fileUtils = require('../utils/file');

class DataPoint {
  constructor() {
    this.details = [];
    this.header = [];
    this.content = [];
  }

  getAllData() {
    return this.collection.find();
  }

  removeAllData() {
    this.content = [];
  }

  addDetail(fileDescriptor) {
    this.details.push({fileDescriptor, header: this.header});
  }

  loadDetail(detail, cb) {
    fileUtils.readFile(detail.fileDescriptor.fullPath, (err, content) => {
      if (err) {
        throw err;
      }

      this.content = content;
      cb();
    });
  }
}

module.exports = DataPoint;
