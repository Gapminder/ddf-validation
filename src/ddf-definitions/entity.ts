import {groupBy, compact, flattenDeep} from 'lodash';
import {parallelLimit} from 'async';
import {Db} from '../data/db';
import {FileDescriptor} from '../data/file-descriptor';

const Mingo = require('mingo');
const COLLECTION_NAME = 'entities';
const PARALLEL_PROCESSES = 5;

export class Entity {
  public db: Db;
  public fileDescriptors: Array<FileDescriptor>;

  private collection: any;

  constructor(db: Db) {
    this.db = db;
    this.collection = this.db.getCollection(COLLECTION_NAME);
    this.fileDescriptors = [];
  }

  getAllData() {
    return this.collection;
  }

  getDataByFiles(): any {
    return groupBy(this.getAllData(), record => record['$$source']);
  }

  getDataBy(condition) {
    const query = new Mingo.Query(condition);

    return query.find(this.collection);
  }

  addFileDescriptor(fileDescriptor) {
    this.fileDescriptors.push(fileDescriptor);
  }

  getTranslationsData(onTranslationsReady) {
    const transActions = this.fileDescriptors.map(fileDescriptor =>
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
    );
    const transActionsNormalized: Array<any> = compact(flattenDeep(transActions));

    parallelLimit(transActionsNormalized, PARALLEL_PROCESSES, onTranslationsReady);
  }
}
