import { createReadStream } from 'fs';

const csv = require('fast-csv');

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
    const fileStream = createReadStream(csvPath);

    let header = [];
    let ddfRecord = {};
    let lineNumber = 1;
    let isError = false;

    fileStream.on('error', error => {
      onCollectionReady(error, []);
    });

    csv
      .fromStream(fileStream, {headers: true})
      .on('data', data => {
        if (lineNumber === 1) {
          header = Object.keys(data);
        }

        ddfRecord = data;
        ddfRecord['$$source'] = csvPath;
        ddfRecord['$$lineNumber'] = lineNumber;
        collection.push(ddfRecord);
        ddfRecord = {};
        lineNumber++;
      })
      .on('end', () => {
        onCollectionReady(null, header);
      })
      .on('error', err => {
        if (!isError) {
          onCollectionReady(err);
          isError = true;
        }
      });
  }

  getCollection(collectionName) {
    if (!this.storage[collectionName]) {
      this.storage[collectionName] = [];
    }

    return this.storage[collectionName];
  }
}
