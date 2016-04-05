'use strict';

const COLLECTION_NAME = 'entities';

class Entity {
  constructor(db) {
    this.db = db;
    this.collection = this.db.getCollection(COLLECTION_NAME);
    this.details = [];
  }

  getAllData() {
    return this.collection.find();
  }

  getDataBy(condition) {
    return this.collection.find(condition);
  }

  addDetail(fileDescriptor, header) {
    this.details.push({fileDescriptor, header});
  }
}

module.exports = Entity;
