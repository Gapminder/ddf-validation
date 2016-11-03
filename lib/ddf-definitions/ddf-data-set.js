'use strict';

const async = require('async');
const _ = require('lodash');
const DDFRoot = require('../data/ddf-root');
const constants = require('./constants');
const Concept = require('./concept');
const Entity = require('./entity');
const DataPoint = require('./data-point');
const Db = require('../data/db');

class DdfDataSet {
  constructor(rootPath, settings) {
    this.db = new Db();
    this.ddfRoot = new DDFRoot(rootPath, settings);
  }

  load(onDataSetLoaded) {
    this.ddfRoot.check(() => {
      const loaders = [];

      this.expectedClass = {
        [constants.CONCEPT]: new Concept(this.db),
        [constants.ENTITY]: new Entity(this.db),
        [constants.DATA_POINT]: new DataPoint(this.db)
      };

      const processDirectoryDescriptor = directoriesDescriptor => {
        directoriesDescriptor.fileDescriptors
          .forEach(fileDescriptor => {
            if (fileDescriptor.is(constants.DATA_POINT)) {
              loaders.push(onFileLoaded => {
                fileDescriptor.fillHeaders(() => {
                  this.expectedClass[fileDescriptor.type].addFileDescriptor(fileDescriptor);
                  onFileLoaded();
                });
              });
            }

            if (fileDescriptor.is([constants.CONCEPT, constants.ENTITY])) {
              loaders.push(onFileLoaded => {
                fileDescriptor.fillHeaders(() => {
                  this.db
                    .fillCollection(
                      Symbol.keyFor(fileDescriptor.type),
                      fileDescriptor.fullPath,
                      err => {
                        this.expectedClass[fileDescriptor.type].addFileDescriptor(fileDescriptor);
                        onFileLoaded(err);
                      });
                });
              });
            }
          });
      };

      this.ddfRoot.directoryDescriptors
        .forEach(directoriesDescriptor => {
          if (directoriesDescriptor.isDDF) {
            processDirectoryDescriptor(directoriesDescriptor);
          }
        });

      async.parallel(loaders, (err, definitions) => {
        const allMeasures = this.getAllMeasures();

        this.definitions = _.compact(definitions);
        this.ddfRoot.directoryDescriptors.forEach(directoryDescriptor => {
          directoryDescriptor.fileDescriptors.forEach(fileDescriptor => {
            fileDescriptor.measures = _.intersection(allMeasures, fileDescriptor.headers);
          });
        });

        onDataSetLoaded(err, this.definitions);
      });
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

  getAllMeasures() {
    return this.getConcept().getAllData()
      .filter(record => record.concept_type === 'measure')
      .map(record => record.concept);
  }
}

module.exports = DdfDataSet;
