'use strict';

const _ = require('lodash');
const Mingo = require('mingo');
const COLLECTION_NAME = 'concepts';

class Concept {
  constructor(db) {
    this.db = db;
    this.collection = this.db.getCollection(COLLECTION_NAME);
    this.fileDescriptors = [];
  }

  getAllData() {
    return this.collection;
  }

  /*eslint camelcase: ["error", {properties: "never"}]*/
  getDataIdsByType(type) {
    const query = new Mingo.Query({concept_type: type});

    return query.find(this.collection).all().map(record => record.concept);
  }

  getRecordByKey(concept) {
    const query = new Mingo.Query({concept});

    return query.find(this.collection).first();
  }

  getDataByFiles() {
    return _.groupBy(this.getAllData(), record => record.$$source);
  }

  getDictionary(concepts, field) {
    const result = {};
    const query = new Mingo.Query(concepts ? {concept: {$in: concepts}} : {});

    query
      .find(this.collection)
      .all()
      .forEach(concept => {
        result[concept.concept] = concept[field];
      });

    return result;
  }

  addFileDescriptor(fileDescriptor) {
    this.fileDescriptors.push(fileDescriptor);
  }

  getIds() {
    return this.getAllData()
      .map(record => record.concept);
  }
}

module.exports = Concept;
