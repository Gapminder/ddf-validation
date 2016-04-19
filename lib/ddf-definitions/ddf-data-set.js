'use strict';

const async = require('async');
const _ = require('lodash');
const DDFRoot = require('../data/root');
const constants = require('./constants');
const Concept = require('./concept');
const Entity = require('./entity');
const DataPoint = require('./data-point');
const Db = require('../data/db');

class DdfDataSet {
  constructor(rootPath) {
    this.db = new Db();
    this.ddfRoot = new DDFRoot(rootPath);
  }

  load(cb) {
    const that = this;

    this.ddfRoot.check(() => {
      const loaders = [];

      this.expectedClass = {
        [constants.CONCEPT]: new Concept(this.db),
        [constants.ENTITY]: new Entity(this.db),
        [constants.DATA_POINT]: new DataPoint(this.db)
      };

      function processDirectoryDescriptor(directoriesDescriptor) {
        directoriesDescriptor.fileDescriptors
          .forEach(fileDescriptor => {
            if (fileDescriptor.is(constants.DATA_POINT)) {
              loaders.push(_cb => {
                fileDescriptor.fillHeaders(() => {
                  that.expectedClass[fileDescriptor.type].addDetail(fileDescriptor);
                  _cb();
                });
              });
            }

            if (fileDescriptor.is([constants.CONCEPT, constants.ENTITY])) {
              loaders.push(_cb => {
                fileDescriptor.fillHeaders(() => {
                  that.db
                    .fillCollection(
                      Symbol.keyFor(fileDescriptor.type),
                      fileDescriptor.fullPath,
                      (err, header) => {
                        that.expectedClass[fileDescriptor.type].addDetail(fileDescriptor, header);
                        _cb(err);
                      });
                });
              });
            }
          });
      }

      this.ddfRoot.directoryDescriptors
        .forEach(directoriesDescriptor => {
          if (directoriesDescriptor.isDDF) {
            processDirectoryDescriptor(directoriesDescriptor);
          }
        });

      async.parallel(loaders, (err, definitions) => {
        this.definitions = definitions.filter(definition => definition !== null);
        cb(err, this.definitions);
      });
    });
  }

  // todo: provide default value when it will be supported
  dismiss(_cb) {
    let cb = _cb;

    if (!cb) {
      cb = _.noop;
    }

    this.db.lokiDB.deleteDatabase({}, () => {
      cb();
    });
  }

  getConcept() {
    return this.expectedClass[constants.CONCEPT];
  }

  getEntity() {
    return this.expectedClass[constants.ENTITY];
  }

  getDataPoint() {
    return this.expectedClass[constants.DATA_POINT];
  }
}

module.exports = DdfDataSet;
