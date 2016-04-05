'use strict';

const COLLECTION_NAME = 'concepts';

class Concept {
  constructor(db) {
    this.db = db;
    this.collection = this.db.getCollection(COLLECTION_NAME);
    this.details = [];
  }

  getAllData() {
    return this.collection.find();
  }

  getDictionary(concepts, field) {
    const result = {};

    this.collection
      .find({concept: {$in: concepts}})
      .forEach(concept => {
        result[concept.concept] = concept[field];
      });

    return result;
  }

  addDetail(fileDescriptor, header) {
    this.details.push({fileDescriptor, header});
  }

  getIds() {
    return this.getAllData()
      .map(record => record.concept);
  }
}

module.exports = Concept;
