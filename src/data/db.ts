import { parse } from 'papaparse';
import { readFile as readFileFs } from 'fs';
import { stripBom } from '../utils/file';

export class Db {
  private storage: any;

  constructor() {
    this.storage = {};
  }

  fillCollection(collectionName, csvPath, onCollectionReady, clearBefore) {
    if (clearBefore) {
      this.storage[collectionName] = [];
    }

    const collection = this.getCollection(collectionName);

    readFileFs(csvPath, 'utf-8', (fileErr, data) => {
      if (fileErr) {
        return onCollectionReady();
      }

      (parse as any)(stripBom(data), {
        header: true,
        quotes: true,
        skipEmptyLines: true,
        complete: result => {
          let lineNumber = 1;

          for (const ddfRecord of result.data) {
            ddfRecord['$$source'] = csvPath;
            ddfRecord['$$lineNumber'] = lineNumber;

            collection.push(ddfRecord);
            lineNumber++;
          }

          onCollectionReady(null, result.data);
        },
        error: onCollectionReady
      });
    });
  }

  getCollection(collectionName) {
    if (!this.storage[collectionName]) {
      this.storage[collectionName] = [];
    }

    return this.storage[collectionName];
  }
}
