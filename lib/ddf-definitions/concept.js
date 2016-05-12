'use strict';

const _ = require('lodash');
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

  /*eslint camelcase: ["error", {properties: "never"}]*/
  getDataIdsByType(type) {
    return this.collection.find({concept_type: type}).map(record => record.concept);
  }

  getRecordByKey(concept) {
    return this.collection.find({concept})[0];
  }

  getDataByFiles() {
    return _.groupBy(this.getAllData(), record => record.$$source);
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
