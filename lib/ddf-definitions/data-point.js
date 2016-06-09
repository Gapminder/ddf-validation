'use strict';

const fileUtils = require('../utils/file');

class DataPoint {
  constructor() {
    this.details = [];
    this.header = [];
  }

  addDetail(fileDescriptor) {
    this.details.push({fileDescriptor, header: this.header});
  }

  loadDetail(detail, onLineRead, onFileRead) {
    fileUtils.walkFile(
      detail.fileDescriptor.fullPath,
      (ddfRecord, line) => onLineRead(ddfRecord, line),
      err => onFileRead(err)
    );
  }
}

module.exports = DataPoint;
