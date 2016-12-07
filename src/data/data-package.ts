import {
  head,
  indexOf,
  drop,
  split,
  isArray,
  flatten,
  first,
  takeRight,
  last,
  compact,
  isEmpty,
} from 'lodash';
import {readFile} from 'fs';
import {parallelLimit} from 'async';
import {resolve, sep} from 'path';
import {
  CONCEPT,
  ENTITY,
  DATA_POINT,
  DDF_SEPARATOR,
  DDF_DATAPOINT_SEPARATOR
} from '../ddf-definitions/constants';
import {Db} from '../data/db';
import {Concept} from '../ddf-definitions/concept';
import {readDir, getFileLine, writeFile, fileExists} from '../utils/file';

const PROCESS_LIMIT = 5;
const CONCEPT_ID = 'concept';
const DATA_PACKAGE_FILE = 'datapackage.json';
const LANG_FOLDER = 'lang';
const CSV_EXTENSION = 'csv';
const REQUIRED_DDF_FILE_PARTS = 2;
const REQUIRED_DATA_POINT_PARTS = 4;

const getConceptType = (fileParts: Array<string>) => {
  if (fileParts.length === 1 && head(fileParts) === 'concepts') {
    return CONCEPT;
  }

  return null;
};
const getEntityType = (fileParts: Array<string>) => {
  if (fileParts.length > 1 && head(fileParts) === 'entities') {
    return ENTITY;
  }

  return null;
};
const getDataPointType = (fileParts: Array<string>) => {
  const baseCheck = fileParts.length > REQUIRED_DATA_POINT_PARTS && head(fileParts) === 'datapoints';
  const indexForBy = indexOf(fileParts, 'by');
  const byCheck = indexForBy > 1 && indexForBy < fileParts.length - 1;

  return baseCheck && byCheck ? DATA_POINT : null;
};
const getDdfParts = (fileParts: Array<string>) => {
  if (fileParts.length >= REQUIRED_DDF_FILE_PARTS && head(fileParts) === 'ddf') {
    return drop(fileParts);
  }

  return null;
};
const parseDdfFile = (folder: string, filename: string): any => {
  const partsByPoint: Array<string> = split(filename, '.');

  if (partsByPoint.length <= 1 || partsByPoint[1] !== CSV_EXTENSION) {
    return {valid: false};
  }

  const ddfParts = getDdfParts(split(head(partsByPoint), DDF_SEPARATOR));

  if (!ddfParts) {
    return {valid: false};
  }

  const type = getConceptType(ddfParts) || getEntityType(ddfParts) || getDataPointType(ddfParts);

  if (!type) {
    return {valid: false};
  }

  return {
    valid: true,
    filename,
    name: head(partsByPoint),
    fullPath: resolve(folder, filename),
    type,
    parts: drop(ddfParts)
  };
};
const getTypeByResource = (resource: any) => {
  if (isArray(resource.schema.primaryKey)) {
    return DATA_POINT;
  }

  if (!isArray(resource.schema.primaryKey) && resource.schema.primaryKey === CONCEPT_ID) {
    return CONCEPT;
  }

  return ENTITY;
};

export class DataPackage {
  public rootFolder: string;
  public errors: Array<any>;
  public warnings: Array<any>;
  public fileDescriptors: Array<any>;
  public dataPackage: any;
  public translationFolders: Array<any>;
  public db: Db;

  constructor(rootFolder: string) {
    this.rootFolder = rootFolder;
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];
    this.dataPackage = null;
  }

  getTranslationFileDescriptors(onTranslationsFileDescriptorsReady: Function) {
    readDir(resolve(this.rootFolder, LANG_FOLDER), (errFolders: any, translationFolders: Array<any>) => {
        if (errFolders) {
          this.warnings.push({
            source: errFolders,
            reason: 'translation folder reading'
          });
          onTranslationsFileDescriptorsReady();
          return;
        }

        const translationsFolderActions = translationFolders.map(translationFolder =>
          (onTranslationFolderReady: Function) => {
            const translationFullFolder =
              resolve(this.rootFolder, LANG_FOLDER, translationFolder);

            this.getDdfFileDescriptors(
              translationFullFolder,
              (folderErr: any, ddfTransFileDescriptors: Array<any> = []) => {
                const transFileDescriptors = ddfTransFileDescriptors
                  .map(transFileDescriptor => {
                    transFileDescriptor.translation = true;

                    return transFileDescriptor;
                  });

                onTranslationFolderReady(folderErr, transFileDescriptors);
              }
            );
          });

        parallelLimit(translationsFolderActions, PROCESS_LIMIT, (err, translationsData) => {
          onTranslationsFileDescriptorsReady(err, translationFolders, flatten(translationsData, true));
        });
      }
    );
  }

  getDdfFileDescriptors(folder: string, onDdfFileDescriptorsReady: Function) {
    readDir(folder, (err: any, files: Array<string> = []) => {
      const ddfFileDescriptors = files
        .map(file => parseDdfFile(folder, file))
        .filter(ddfFile => ddfFile.type);

      onDdfFileDescriptorsReady(err, ddfFileDescriptors);
    });
  }

  fillHeaders(onHeadersReady: any) {
    const headerGetActions = this.fileDescriptors.map((fileDescriptor: any) => onHeaderReady => {
      getFileLine(fileDescriptor.fullPath, 0, (err, firstLine) => {
          fileDescriptor.headers = err ? [] : split((firstLine || '').trim(), ',');
          onHeaderReady();
        }
      );
    });

    parallelLimit(headerGetActions, PROCESS_LIMIT, onHeadersReady);
  }

  fillPrimaryKeys(conceptTypeHash) {
    const fillConceptPrimaryKey = fileDescriptor => {
      fileDescriptor.primaryKey = 'concept';
    };
    const fillEntityPrimaryKey = fileDescriptor => {
      const ONLY_TWO = 2;

      if (fileDescriptor.parts.length !== ONLY_TWO) {
        fileDescriptor.primaryKey = first(fileDescriptor.parts);
        return;
      }

      const entityDomain = fileDescriptor.headers.find(header => conceptTypeHash[header] === 'entity_domain');
      const entitySet = fileDescriptor.headers.find(header => conceptTypeHash[header] === 'entity_set');

      fileDescriptor.primaryKey = entityDomain || entitySet;
    };
    const fillDataPointPrimaryKey = fileDescriptor => {
      const ddfDataPointSeparatorPos = indexOf(fileDescriptor.parts, DDF_DATAPOINT_SEPARATOR);
      const primaryKeyPartsCount = fileDescriptor.parts.length - ddfDataPointSeparatorPos - 1;

      fileDescriptor.primaryKey = takeRight(fileDescriptor.parts, primaryKeyPartsCount);
    };

    this.fileDescriptors
      .forEach(fileDescriptor => {
        if (fileDescriptor.type === CONCEPT) {
          fillConceptPrimaryKey(fileDescriptor);
        }

        if (fileDescriptor.type === ENTITY) {
          fillEntityPrimaryKey(fileDescriptor);
        }

        if (fileDescriptor.type === DATA_POINT) {
          fillDataPointPrimaryKey(fileDescriptor);
        }
      });
  }

  getDataPackageObject() {
    const rootFolderParts: Array<string> = split(this.rootFolder, sep);
    const packageName: string = last(rootFolderParts);

    return {
      name: packageName,
      title: packageName,
      description: '',
      version: '0.0.1',
      language: {id: 'en', name: 'English'},
      translations: this.translationFolders
        .map(translation => ({id: translation, name: translation})),
      license: '',
      author: '',
      resources: this.fileDescriptors
        .map(fileDescriptor => ({
          path: fileDescriptor.filename,
          name: fileDescriptor.name,
          schema: {
            fields: (fileDescriptor.headers || [])
              .map(header => ({name: header})),
            primaryKey: fileDescriptor.primaryKey
          }
        }))
    };
  }

  getType(filename) {
    return head(
      this.fileDescriptors
        .filter(fileDescriptor => fileDescriptor.filename === filename)
        .map(fileDescriptor => fileDescriptor.type)
    );
  }

  build(onDataPackageReady) {
    this.db = new Db();
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];

    this.getDdfFileDescriptors(this.rootFolder, (ddfFileErr, ddfFileDescriptors) => {
      if (ddfFileErr) {
        this.errors.push({
          source: ddfFileErr,
          reason: 'ddf files reading'
        });

        onDataPackageReady();
        return;
      }

      this.getTranslationFileDescriptors(
        (translationsErr, translationFolders) => {
          this.warnings.push({
            source: translationsErr,
            reason: 'translation file reading'
          });

          this.fileDescriptors = compact(ddfFileDescriptors);
          this.translationFolders = translationFolders || [];
          this.fillHeaders(headersError => {
            if (headersError) {
              this.errors.push({source: headersError, reason: 'headers reading'});
            }

            const concept = new Concept(this.db);
            const conceptLoadingActions = this.fileDescriptors
              .filter(fileDescriptor => fileDescriptor.type === CONCEPT)
              .map(fileDescriptor => {
                return onFileLoaded => {
                  this.db.fillCollection(
                    Symbol.keyFor(fileDescriptor.type),
                    fileDescriptor.fullPath,
                    onFileLoaded,
                    false);
                };
              });

            parallelLimit(conceptLoadingActions, PROCESS_LIMIT, conceptsErr => {
              if (conceptsErr) {
                this.errors.push({source: conceptsErr, reason: 'concepts reading'});
              }

              const conceptTypeHash = concept.getDictionary(null, 'concept_type');

              this.fillPrimaryKeys(conceptTypeHash);
              this.dataPackage = this.getDataPackageObject();

              onDataPackageReady(this.dataPackage);
            });
          });
        }
      );
    });
  }

  write(onDataPackageFileReady) {
    const dateLabel = new Date().toISOString().replace(/:/g, '');
    const filePath = resolve(this.rootFolder, `${DATA_PACKAGE_FILE}.${dateLabel}`);

    this.build(() => {
      writeFile(
        filePath,
        JSON.stringify(this.dataPackage, null, '\t'),
        err => onDataPackageFileReady(err, filePath)
      );
    });
  }

  read(onDataPackageReady) {
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];

    readFile(
      resolve(this.rootFolder, DATA_PACKAGE_FILE),
      'utf8',
      (fileErr, content) => {
        if (fileErr) {
          this.errors.push({
            source: fileErr,
            reason: `${DATA_PACKAGE_FILE} reading`
          });
        }

        try {
          this.dataPackage = JSON.parse(content);
          this.getTranslationFileDescriptors(
            (translationsErr, translationFolders) => {
              this.warnings.push({
                source: translationsErr,
                reason: 'translation file reading'
              });

              this.translationFolders = translationFolders || [];

              onDataPackageReady(this.dataPackage);
            });
        } catch (contentErr) {
          this.errors.push({
            source: contentErr,
            reason: `${DATA_PACKAGE_FILE} parsing`
          });

          onDataPackageReady();
        }
      });
  }

  getResources() {
    return this.dataPackage.resources;
  }

  getTranslations() {
    return this.dataPackage.translations || [];
  }

  take(onDataPackageReady) {
    const filePath = resolve(this.rootFolder, DATA_PACKAGE_FILE);

    fileExists(filePath, (err, isExists) => {
      if (err || !isExists) {
        this.build(dataPackage => onDataPackageReady(dataPackage));
        return;
      }

      this.read(dataPackage => {
        this.fileDescriptors = dataPackage.resources.map(resource => ({
          filename: resource.path,
          name: resource.name,
          fullPath: resolve(this.rootFolder, resource.path),
          type: getTypeByResource(resource)
        }));

        this.fillHeaders(headersError => {
          if (headersError) {
            this.errors.push({
              source: headersError,
              reason: 'headers reading'
            });
          }

          onDataPackageReady(dataPackage);
        });
      });
    });
  }

  isValid() {
    return isEmpty(this.errors);
  }
}
