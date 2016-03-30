'use strict';

const COLLECTION_NAME = 'entities';

class Entity {
  constructor(db) {
    this.db = db;
    this.collection = this.db.getCollection(COLLECTION_NAME);
    this.details = [];
  }

  addDetail(fileDescriptor, header) {
    this.details.push({fileDescriptor, header});
  }
}

module.exports = Entity;
