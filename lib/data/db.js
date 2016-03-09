'use strict';
const csv = require('csv-stream');
const path = require('path');
const fs = require('fs');
const LokiDB = require('lokijs');

const CSV_OPTIONS = {
  escapeChar: '"',
  enclosedChar: '"'
};

function fillNick() {
  const now = new Date();
  const MONTH_OFFSET_1 = 1;
  const month = now.getMonth() + MONTH_OFFSET_1;

  return `${now.getFullYear()}-${month}-${now.getDay()}T${now.getHours()}:${now.getMinutes()}`;
}

class Db {
  constructor(nick, _options) {
    const options = _options || {};

    this.nick = nick || fillNick();
    this.path = options.path || './_results';
    this.inst = new LokiDB(path.resolve(this.path, `${this.nick}.csv`));
  }

  fillCollection(collectionName, _path, cb) {
    const collection = this.getCollection(collectionName);
    let tmpObj = {};
    const csvStream = csv.createStream(CSV_OPTIONS);
    const fileStream = fs.createReadStream(_path);

    fileStream.on('error', err => cb(err));
    fileStream.on('readable', () => {
      fileStream
        .pipe(csvStream)
        .on('error', err => {
          cb(err);
        })
        .on('data', () => {
          collection.insert(tmpObj);
          tmpObj = {};
        })
        .on('column', (key, value) => {
          if (value) {
            tmpObj[key] = value;
          }
        });
    });
    fileStream.on('end', () => {
      cb();
    });
  }

  getCollection(collectionName) {
    let collection = this.inst.getCollection(collectionName);

    if (!collection) {
      collection = this.inst.addCollection(collectionName);
    }

    return collection;
  }

  save() {
    this.inst.saveDatabase();
  }
}

module.exports = Db;
