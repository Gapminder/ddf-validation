import {groupBy, compact, flattenDeep} from 'lodash';
import {parallelLimit} from 'async';
import {Db} from '../data/db';
import {FileDescriptor} from '../data/file-descriptor';

const Mingo = require('mingo');
const COLLECTION_NAME = 'concepts';
const PARALLEL_PROCESSES = 5;

export class Concept {
  public db: Db;
  public fileDescriptors: Array<FileDescriptor>;

  private collection: any;

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

  getDataByFiles(): any {
    return groupBy(this.getAllData(), record => record['$$source']);
  }

  getDictionary(concepts, field) {
    const result = {};
    const query = new Mingo.Query(concepts ? {concept: {$in: concepts}} : {});

    query.find(this.collection).all().forEach(concept => {
      result[concept.concept] = concept[field];
    });

    return result;
  }

  addFileDescriptor(fileDescriptor) {
    this.fileDescriptors.push(fileDescriptor);
  }

  getIds() {
    return this.getAllData().map(record => record.concept);
  }

  getTranslationsData(onTranslationsReady) {
    const transActions: Array<any> = this.fileDescriptors.map(fileDescriptor =>
      fileDescriptor.getExistingTranslationDescriptors()
        .map(translationDesc => onTranslationLoaded => {
          const transCollectionName = `translation-${translationDesc.file}`;

          this.db.fillCollection(transCollectionName, translationDesc.fullPath, err => {
            translationDesc.content = this.db.getCollection(transCollectionName);
            onTranslationLoaded(err);
          }, true);
        })
    );
    const transActionsNormalized: Array<any> = compact(flattenDeep(transActions));

    parallelLimit(transActionsNormalized, PARALLEL_PROCESSES, onTranslationsReady);
  }
}
