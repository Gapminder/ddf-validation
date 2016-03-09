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
  return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDay() +
    'T' + now.getHours() + ':' + now.getMinutes();
}

class Db {
  constructor(nick, options) {
    options = options || {};
    this.nick = nick || fillNick();
    this.path = options.path || './_results';
    this.inst = new LokiDB(path.resolve(this.path, this.nick + '.csv'));
  }

  _getCollection(collectionName) {
    let collection = this.inst.getCollection(collectionName);
    if (!collection) {
      collection = this.inst.addCollection(collectionName);
    }

    return collection;
  }

  fillCollection(collectionName, path, cb) {
    const collection = this._getCollection(collectionName);
    let tmpObj = {};
    const csvStream = csv.createStream(CSV_OPTIONS);
    const fileStream = fs.createReadStream(path);

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
    return this.inst.getCollection(collectionName);
  }

  save() {
    this.inst.saveDatabase();
  }
}

module.exports = Db;
