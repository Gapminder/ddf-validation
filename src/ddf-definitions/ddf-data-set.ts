import { parallelLimit } from 'async';
import { compact, intersection, isEmpty } from 'lodash';
import { CONCEPT, ENTITY, DATA_POINT } from './constants'
import { Concept } from './concept';
import { Entity } from './entity';
import { DataPoint } from './data-point';
import { Db } from '../data/db';
import { DDFRoot } from '../data/ddf-root';
import { DataPackage } from '../data/data-package';
import { logger } from '../utils';
import { CONCEPT_TYPE_MEASURE } from '../utils/ddf-things';

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

      const processFileDescriptors = (ddfRoot: DDFRoot) => {
        const expectedFileDescriptors = ddfRoot.fileDescriptors.filter(fileDescriptor => isEmpty(fileDescriptor.issues));

        logger.progressInit('dataset loading', {total: expectedFileDescriptors.length});

        expectedFileDescriptors.forEach(fileDescriptor => {
          if (fileDescriptor.is(DATA_POINT) && fileDescriptor.csvChecker.isCorrect()) {
            loaders.push(onFileLoaded => {
              fileDescriptor.fillHeaders(() => {
                this.expectedClass[fileDescriptor.type].addDescriptors(fileDescriptor, ddfRoot.dataPackageDescriptor);

                logger.progress();

                onFileLoaded();
              });
            });
          }

          if (fileDescriptor.is([CONCEPT, ENTITY]) && fileDescriptor.csvChecker.isCorrect()) {
            loaders.push(onFileLoaded => {
              fileDescriptor.fillHeaders(() => {
                this.db.fillCollection(
                  Symbol.keyFor(fileDescriptor.type),
                  fileDescriptor.fullPath,
                  fileErr => {
                    this.expectedClass[fileDescriptor.type].addFileDescriptor(fileDescriptor);
                    this.expectedClass[fileDescriptor.type].getTranslationsData(translationsErr => onFileLoaded(fileErr || translationsErr));

                    logger.progress();
                  }, false);
              });
            });
          }
        });
      };

      if (this.ddfRoot.isDDF) {
        processFileDescriptors(this.ddfRoot);
      }

      parallelLimit(loaders, 30, (err, definitions) => {
        const allMeasures = this.getAllMeasures();

        this.definitions = compact(definitions);
        this.ddfRoot.fileDescriptors.forEach(fileDescriptor => {
          fileDescriptor.measures = intersection(allMeasures, fileDescriptor.headers);
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
      .filter(record => record.concept_type === CONCEPT_TYPE_MEASURE)
      .map(record => record.concept);
  }

  getDataPackageResources() {
    return this.ddfRoot.getDataPackageResources();
  }

  getDataPackageSchema() {
    return this.ddfRoot.getDataPackageSchema();
  }

  getDataPackageDescriptor(): DataPackage {
    return this.ddfRoot.dataPackageDescriptor;
  }
}
