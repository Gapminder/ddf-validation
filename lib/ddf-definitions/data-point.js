'use strict';

class DataPoint {
  constructor(db, fileDescriptor) {
    this.db = db;
    this.fileDescriptor = fileDescriptor;
    this.details = [];
  }

  getAllData() {
    return this.collection.find();
  }

  addDetail(fileDescriptor, header) {
    this.details.push({fileDescriptor, header});
  }
}

module.exports = DataPoint;
