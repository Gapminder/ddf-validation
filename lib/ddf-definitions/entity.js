'use strict';

const _ = require('lodash');
const Mingo = require('mingo');
const COLLECTION_NAME = 'entities';

class Entity {
  constructor(db) {
    this.db = db;
    this.collection = this.db.getCollection(COLLECTION_NAME);
    this.fileDescriptors = [];
  }

  getAllData() {
    return this.collection;
  }

  getDataByFiles() {
    return _.groupBy(this.getAllData(), record => record.$$source);
  }

  getDataBy(condition) {
    const query = new Mingo.Query(condition);

    return query.find(this.collection);
  }

  addFileDescriptor(fileDescriptor) {
    this.fileDescriptors.push(fileDescriptor);
  }
}

module.exports = Entity;
