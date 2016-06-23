'use strict';
const csv = require('fast-csv');
const path = require('path');
const fs = require('fs');
const LokiDB = require('lokijs');

function getFileName() {
  const now = new Date();
  const month = now.getMonth() + 1;

  return `${now.getFullYear()}-${month}-${now.getDay()}T${now.getHours()}:${now.getMinutes()}`;
}

class Db {
  constructor(fileName, _options) {
    const options = _options || {};

    this.fileName = fileName || getFileName();
    this.path = options.path || './_results';
    this.fullPath = path.resolve(this.path, `${this.fileName}.csv`);
    this.lokiDB = new LokiDB(this.fullPath);
  }

  fillCollection(collectionName, _path, cb) {
    const collection = this.getCollection(collectionName);
    const fileStream = fs.createReadStream(_path);

    let header = [];
    let ddfRecord = {};
    let lineNumber = 1;

    fileStream.on('error', error => {
      cb(error, []);
    });

    csv
      .fromStream(fileStream, {headers: true})
      .on('data', data => {
        if (lineNumber === 1) {
          header = Object.keys(data);
        }

        ddfRecord = data;
        ddfRecord.$$source = _path;
        ddfRecord.$$lineNumber = lineNumber;
        collection.insert(ddfRecord);
        ddfRecord = {};
        lineNumber++;
      })
      .on('end', () => cb(null, header));
  }

  getCollection(collectionName) {
    let collection = this.lokiDB.getCollection(collectionName);

    if (!collection) {
      collection = this.lokiDB.addCollection(collectionName);
    }

    return collection;
  }
}

module.exports = Db;
