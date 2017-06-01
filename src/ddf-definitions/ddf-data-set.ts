import { parallel } from 'async';
import { compact, intersection, isEmpty } from 'lodash';
import { DirectoryDescriptor } from '../data/directory-descriptor'
import { CONCEPT, ENTITY, DATA_POINT } from './constants'
import { Concept } from './concept';
import { Entity } from './entity';
import { DataPoint } from './data-point';
import { Db } from '../data/db';
import { DDFRoot } from '../data/ddf-root';

export class DdfDataSet {
  public db: Db;
  public ddfRoot: DDFRoot;
  public expectedClass: any;
  public definitions: any;

  constructor(rootPath: string, settings: any, ignoreExistingDataPackage: boolean = false) {
    this.db = new Db();
    this.ddfRoot = new DDFRoot(rootPath, settings, ignoreExistingDataPackage);
  }

  load(onDataSetLoaded) {
    this.ddfRoot.check(() => {
      const loaders = [];

      this.expectedClass = {
        [CONCEPT]: new Concept(this.db),
        [ENTITY]: new Entity(this.db),
        [DATA_POINT]: new DataPoint()
      };

      const processDirectoryDescriptor = (directoriesDescriptor: DirectoryDescriptor) => {
        directoriesDescriptor.fileDescriptors
          .filter(fileDescriptor => isEmpty(fileDescriptor.issues))
          .forEach(fileDescriptor => {
            if (fileDescriptor.is(DATA_POINT)) {
              loaders.push(onFileLoaded => {
                fileDescriptor.fillHeaders(() => {
                  this.expectedClass[fileDescriptor.type].addFileDescriptor(fileDescriptor);
                  onFileLoaded();
                });
              });
            }

            if (fileDescriptor.is([CONCEPT, ENTITY])) {
              loaders.push(onFileLoaded => {
                fileDescriptor.fillHeaders(() => {
                  this.db.fillCollection(
                    Symbol.keyFor(fileDescriptor.type),
                    fileDescriptor.fullPath,
                    fileErr => {
                      this.expectedClass[fileDescriptor.type].addFileDescriptor(fileDescriptor);
                      this.expectedClass[fileDescriptor.type].getTranslationsData(translationsErr =>
                        onFileLoaded(fileErr || translationsErr));
                    }, false);
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

      parallel(loaders, (err, definitions) => {
        const allMeasures = this.getAllMeasures();

        this.definitions = compact(definitions);
        this.ddfRoot.directoryDescriptors.forEach(directoryDescriptor => {
          directoryDescriptor.fileDescriptors.forEach(fileDescriptor => {
            fileDescriptor.measures = intersection(allMeasures, fileDescriptor.headers);
          });
        });

        onDataSetLoaded(err, this.definitions);
      });
    });
  }

  getConcept() {
    return this.expectedClass[CONCEPT];
  }

  getEntity() {
    return this.expectedClass[ENTITY];
  }

  getDataPoint() {
    return this.expectedClass[DATA_POINT];
  }

  getAllMeasures() {
    return this.getConcept().getAllData()
      .filter(record => record.concept_type === 'measure')
      .map(record => record.concept);
  }
}
