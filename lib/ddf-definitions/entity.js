'use strict';

const _ = require('lodash');
const async = require('async');
const Mingo = require('mingo');
const COLLECTION_NAME = 'entities';
const PARALLEL_PROCESSES = 5;

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

  getTranslationsData(onTranslationsReady) {
    const transActions = _.compact(_.flattenDeep(
      this.fileDescriptors.map(fileDescriptor =>
        fileDescriptor.getExistingTranslationDescriptors().map(translationDesc => onTranslationLoaded => {
          const transCollectionName = `translation-${translationDesc.file}`;

          this.db.fillCollection(
            transCollectionName,
            translationDesc.fullPath,
            err => {
              translationDesc.content = this.db.getCollection(transCollectionName);
              onTranslationLoaded(err);
            }, true);
        })
      )
    ));

    async.parallelLimit(transActions, PARALLEL_PROCESSES, onTranslationsReady);
  }
}

module.exports = Entity;
