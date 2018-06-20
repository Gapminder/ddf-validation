import { parallelLimit } from 'async';
import { compact, intersection, isEmpty, includes, isArray, sortBy, cloneDeep } from 'lodash';
import {
  CONCEPT,
  ENTITY,
  DATA_POINT,
  SYNONYM,
  TRNSLATIONS_FOLDER,
  getTypeByPrimaryKey
} from './constants'
import { Concept } from './concept';
import { Entity } from './entity';
import { Synonym } from './synonym';
import { DataPoint } from './data-point';
import { Db } from '../data/db';
import { DATA_PACKAGE_FILE, DataPackage } from '../data/data-package';
import { logger } from '../utils';
import { supervisor } from '../shared';
import { CONCEPT_TYPE_MEASURE } from '../utils/ddf-things';
import { FileDescriptor } from '../data/file-descriptor';
import { getExcludedDirs } from '../data/shared';
import { resolve } from 'path';
import { getDdfSchemaContent } from '../data/ddf-schema';
import { writeFile } from '../utils/file';

const PROCESS_LIMIT = 30;

export class DdfDataSet {
  public db: Db;
  public expectedClass: any;
  public definitions: any;
  public errors: any[];
  public settings: any;
  public ignoreExistingDataPackage: boolean;
  public dataPackageDescriptor: DataPackage;
  public isEmpty: boolean;
  public isDDF: boolean;
  public fileDescriptors: FileDescriptor[];

  constructor(public rootPath: string, settings: any, ignoreExistingDataPackage: boolean = false) {
    this.db = new Db();
    this.settings = settings || {};
    this.settings.excludeDirs = getExcludedDirs(this.settings);
    this.errors = [];
    this.ignoreExistingDataPackage = ignoreExistingDataPackage;
    this.isEmpty = false;
    this.isDDF = true;
    this.fileDescriptors = [];
    this.expectedClass = {
      [CONCEPT]: new Concept(this.db),
      [ENTITY]: new Entity(this.db),
      [SYNONYM]: new Synonym(this.db),
      [DATA_POINT]: new DataPoint()
    };
  }

  load(onDataSetLoaded) {
    this.check(() => {
      const loaders = [];

      if (this.isDDF) {
        const expectedFileDescriptors = this.fileDescriptors.filter(fileDescriptor => isEmpty(fileDescriptor.issues));

        logger.progressInit('dataset loading', {total: expectedFileDescriptors.length});

        expectedFileDescriptors.forEach(fileDescriptor => {
          if (fileDescriptor.is(DATA_POINT) && fileDescriptor.csvChecker.isCorrect()) {
            loaders.push(onFileLoaded => {
              fileDescriptor.fillHeaders(() => {
                this.expectedClass[fileDescriptor.type].addDescriptors(fileDescriptor, this.dataPackageDescriptor);

                logger.progress();

                onFileLoaded();
              });
            });
          }

          if (fileDescriptor.is([CONCEPT, ENTITY, SYNONYM]) && fileDescriptor.csvChecker.isCorrect()) {
            loaders.push(onFileLoaded => {
              fileDescriptor.fillHeaders(() => {
                this.db.fillCollection(
                  Symbol.keyFor(fileDescriptor.type),
                  fileDescriptor.fullPath,
                  fileErr => {
                    this.expectedClass[fileDescriptor.type].addFileDescriptor(fileDescriptor);

                    if (this.expectedClass[fileDescriptor.type].getTranslationsData) {
                      this.expectedClass[fileDescriptor.type]
                        .getTranslationsData(translationsErr =>
                          onFileLoaded(fileErr || translationsErr));
                    } else {
                      onFileLoaded(fileErr);
                    }

                    logger.progress();
                  }, false);
              });
            });
          }
        });
      }

      parallelLimit(loaders, 10, (err, definitions) => {
        if (supervisor.abandon) {
          return onDataSetLoaded(new Error('abandoned by external reason'));
        }

        const allMeasures = this.getAllMeasures();

        this.definitions = compact(definitions);
        this.fileDescriptors.forEach(fileDescriptor => {
          fileDescriptor.measures = intersection(allMeasures, fileDescriptor.headers);
        });

        onDataSetLoaded(err);
      });
    });
  }

  getConcept() {
    return this.expectedClass[CONCEPT];
  }

  getEntity() {
    return this.expectedClass[ENTITY];
  }

  getSynonym() {
    return this.expectedClass[SYNONYM];
  }

  getDataPoint() {
    return this.expectedClass[DATA_POINT];
  }

  getAllMeasures() {
    return this.getConcept().getAllData()
      .filter(record => record.concept_type === CONCEPT_TYPE_MEASURE)
      .map(record => record.concept);
  }

  getConceptsByType(...types: string[]) {
    return this.getConcept().getAllData()
      .filter(record => includes(types, record.concept_type))
      .map(record => record.concept);
  }

  getDataPackageDescriptor(): DataPackage {
    return this.dataPackageDescriptor;
  }

  getTranslations(onTranslationsReady) {
    if (isEmpty(this.dataPackageDescriptor.getTranslations())) {
      onTranslationsReady();
      return;
    }

    const translationsIds = this.dataPackageDescriptor.getTranslations().map(translation => translation.id);

    this.fileDescriptors.forEach(fileDescriptor => {
      const translationFolder = resolve(this.rootPath, TRNSLATIONS_FOLDER);

      fileDescriptor.transFileDescriptors = translationsIds
        .map(translationId =>
          new FileDescriptor({
            dir: resolve(translationFolder, translationId),
            file: fileDescriptor.file,
            type: fileDescriptor.type,
            primaryKey: fileDescriptor.primaryKey,
            fullPath: resolve(translationFolder, translationId, fileDescriptor.file),
            translationId,
            isTranslation: true
          }));
    });

    const transFileActions = this.fileDescriptors
      .map(fileDescriptor =>
        onTransFileReady =>
          fileDescriptor.checkTranslations(onTransFileReady));

    parallelLimit(transFileActions, PROCESS_LIMIT, onTranslationsReady);
  }

  check(onDirectoryDescriptorReady: Function) {
    const process = (dataPackageObject) => {
      if (!this.dataPackageDescriptor.isValid()) {
        this.isDDF = false;
        onDirectoryDescriptorReady();
        return;
      }

      const expectedResources = !this.settings.datapointlessMode ? dataPackageObject.resources :
        dataPackageObject.resources.filter(ddfResource => getTypeByPrimaryKey(ddfResource.schema.primaryKey) !== DATA_POINT);

      this.fileDescriptors = expectedResources.map(ddfResource => this.getFileDescriptor(this.rootPath, ddfResource));

      logger.progressInit('root checking', {total: this.fileDescriptors.length});

      const actions = this.fileDescriptors.map(fileDescriptor =>
        onFileChecked => fileDescriptor.check(onFileChecked));

      parallelLimit(
        actions,
        PROCESS_LIMIT,
        checkErr => {
          if (checkErr) {
            onDirectoryDescriptorReady(checkErr);
            return;
          }

          this.getTranslations(onDirectoryDescriptorReady);
        }
      );
    };

    this.dataPackageDescriptor = new DataPackage(this.rootPath, this.settings);
    this.dataPackageDescriptor.take(() => {
      process(this.dataPackageDescriptor.getDataPackageObject());
    }, this.ignoreExistingDataPackage);
  }

  createDataPackage(onDataPackageCreated: Function) {
    this.load(loadErr => {
      if (loadErr) {
        return onDataPackageCreated(loadErr);
      }

      this.fillDdfSchema((schemaErr, ddfSchema) => {
        this.dataPackageDescriptor.setSchema(ddfSchema);

        onDataPackageCreated(schemaErr);
      });
    });
  }

  getFileDescriptor(dir, ddfResource) {
    return new FileDescriptor({
      dir,
      file: ddfResource.path,
      type: getTypeByPrimaryKey(ddfResource.schema.primaryKey),
      headers: ddfResource.schema.fields,
      primaryKey: ddfResource.schema.primaryKey,
      fullPath: resolve(dir, ddfResource.path)
    });
  }

  getDataPackageResources() {
    return this.dataPackageDescriptor.getDataPackageObject().resources;
  }

  getDataPackageSchema() {
    return this.dataPackageDescriptor.getDataPackageObject().ddfSchema;
  }

  fillDdfSchema(onDdfSchemaReady: Function, isSilent = false) {
    const settings = cloneDeep(this.settings);

    settings.silent = isSilent;

    if (!settings.silent) {
      logger.notice('loading generic content...');
    }

    const resources = this.getDataPackageResources().map(resource => {
      if (!isArray(resource.schema.primaryKey)) {
        resource.schema.primaryKey = [resource.schema.primaryKey];
      }

      resource.schema.fields = resource.schema.fields.map(field => field.name);

      return resource;
    });

    const conceptsResources = resources.filter(resource => getTypeByPrimaryKey(resource.schema.primaryKey) === CONCEPT);
    const entitiesResources = resources.filter(resource => getTypeByPrimaryKey(resource.schema.primaryKey) === ENTITY);
    const getOrderedSection = (section: any[]) => {
      section.forEach(dataPointDescriptor => {
        dataPointDescriptor.resources = sortBy(dataPointDescriptor.resources);
      });

      return sortBy(section, ['primaryKey', 'value']);
    };

    if (!settings.silent) {
      logger.notice('generating ddfSchema...');
    }

    getDdfSchemaContent({
      resources,
      conceptsResources,
      entitiesResources,
      ddfDataSet: this,
      dataPackageDescriptor: this.dataPackageDescriptor
    }, settings.isProgressNeeded, (err, ddfSchema) => {
      if (err) {
        return onDdfSchemaReady(err);
      }

      ddfSchema.datapoints = getOrderedSection(ddfSchema.datapoints);
      ddfSchema.entities = getOrderedSection(ddfSchema.entities);
      ddfSchema.concepts = getOrderedSection(ddfSchema.concepts);
      ddfSchema.synonyms = getOrderedSection(ddfSchema.synonyms);

      onDdfSchemaReady(null, ddfSchema);
    });
  }

  writeDataPackage(settings: any, existingDataPackage: any, onDataPackageFileReady: Function) {
    const dateLabel = new Date().toISOString().replace(/:/g, '');
    const isBasedOnCurrentDataPackage =
      (existingDataPackage && (settings.updateDataPackageTranslations || settings.updateDataPackageContent));
    const fileName = isBasedOnCurrentDataPackage || (!existingDataPackage || settings._newDataPackagePriority) ?
      DATA_PACKAGE_FILE : `${DATA_PACKAGE_FILE}.${dateLabel}`;
    const filePath = resolve(this.rootPath, fileName);
    const commandLineSettings = cloneDeep(this.settings);

    commandLineSettings.isProgressNeeded = true;

    this.createDataPackage(() => {
      const contentToOut = cloneDeep(isBasedOnCurrentDataPackage ? existingDataPackage :
        this.getDataPackageDescriptor().getDataPackageObject());

      if (settings.updateDataPackageTranslations) {
        contentToOut.translations = this.getDataPackageDescriptor().getDataPackageObject().translations;
      }

      if (settings.updateDataPackageContent) {
        contentToOut.resources = this.getDataPackageResources();
        contentToOut.ddfSchema = this.getDataPackageSchema();
      }

      if (!isBasedOnCurrentDataPackage) {
        contentToOut.ddfSchema = this.getDataPackageSchema();
      }

      const content = settings.compressDatapackage ?
        JSON.stringify(contentToOut) : JSON.stringify(contentToOut, null, 2);

      writeFile(filePath, content, err => onDataPackageFileReady(err, filePath));

    });
  }
}
