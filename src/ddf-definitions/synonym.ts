import { groupBy } from 'lodash';
import { Db } from '../data/db';
import { FileDescriptor } from '../data/file-descriptor';

const COLLECTION_NAME = 'synonyms';

export class Synonym {
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

  addFileDescriptor(fileDescriptor) {
    this.fileDescriptors.push(fileDescriptor);
  }
}
