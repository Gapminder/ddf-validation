'use strict';
const csv = require('csv-stream');
const path = require('path');
const fs = require('fs');
const LokiDB = require('lokijs');

const CSV_OPTIONS = {
  escapeChar: '"',
  enclosedChar: '"'
};

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
    const csvStream = csv.createStream(CSV_OPTIONS);
    const fileStream = fs.createReadStream(_path);
    const header = [];

    let ddfRecord = {};
    let headerWasRead = false;

    fileStream.on('error', err => cb(err));
    fileStream.on('readable', () => {
      fileStream
        .pipe(csvStream)
        .on('error', err => {
          cb(err);
        })
        .on('data', () => {
          headerWasRead = true;
          ddfRecord.$$source = _path;
          collection.insert(ddfRecord);
          ddfRecord = {};
        })
        .on('column', (key, value) => {
          if (headerWasRead === false) {
            header.push(key);
          }

          if (value) {
            ddfRecord[key] = value;
          }
        });
    });
    fileStream.on('end', () => {
      cb(null, header);
    });
  }

  getCollection(collectionName) {
    let collection = this.lokiDB.getCollection(collectionName);

    if (!collection) {
      collection = this.lokiDB.addCollection(collectionName);
    }

    return collection;
  }

  save() {
    this.lokiDB.saveDatabase();
  }
}

module.exports = Db;
