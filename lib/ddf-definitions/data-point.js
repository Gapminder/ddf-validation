'use strict';

const fileUtils = require('../utils/file');

class DataPoint {
  constructor() {
    this.fileDescriptors = [];
  }

  addFileDescriptor(fileDescriptor) {
    this.fileDescriptors.push(fileDescriptor);
  }

  loadFile(fileDescriptor, onLineRead, onFileRead) {
    fileUtils.walkFile(
      fileDescriptor.fullPath,
      (ddfRecord, line) => onLineRead(ddfRecord, line),
      err => onFileRead(err)
    );
  }
}

module.exports = DataPoint;
