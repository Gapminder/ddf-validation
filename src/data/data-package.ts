import * as path from 'path';
import * as CsvParser from 'papaparse';
import {
  head,
  drop,
  split,
  indexOf,
  flatten,
  last,
  includes,
  compact,
  isEmpty,
  takeRight,
  tail
} from 'lodash';
import { readFileSync } from 'fs';
import { parallelLimit } from 'async';
import { resolve, sep } from 'path';
import {
  CONCEPT,
  ENTITY,
  SYNONYM,
  DATA_POINT,
  DDF_SEPARATOR,
  DDF_DATAPOINT_SEPARATOR,
  CONCEPT_ID,
  SYNONYM_ID,
  CONCEPT_TYPE, DOMAIN_ID
} from '../ddf-definitions/constants';
import { validate } from 'datapackage';
import { Db } from '../data/db';
import { Concept } from '../ddf-definitions/concept';
import { readDir, getFileLine, fileExists, walkDir } from '../utils/file';
import { getExcludedDirs, isPathExpected } from './shared';
import { logger } from '../utils';
import { CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_ENTITY_SET } from '../utils/ddf-things';

export interface IDdfFileDescriptor {
  valid: boolean;
  filename?: string;
  name?: string;
  fullPath?: string;
  rootFolder?: string;
  type?: symbol;
  parts?: string[];
  constraints?: any;
  headers?: string[];
  primaryKey?: string | string[];
  directoryIndex?: number
}

export const DATA_PACKAGE_FILE = 'datapackage.json';

const PROCESS_LIMIT = 5;
const LANG_FOLDER = 'lang';
const CSV_EXTENSION = 'csv';
const REQUIRED_DDF_FILE_PARTS = 2;

const getConceptType = (fileParts: string[]) => head(fileParts) === 'concepts' ? CONCEPT : null;
const getEntityType = (fileParts: string[]) => head(fileParts) === 'entities' ? ENTITY : null;
const getSynonymType = (fileParts: string[]) => head(fileParts) === 'synonyms' ? SYNONYM : null;
const getDataPointType = (fileParts: string[]) => head(fileParts) === 'datapoints' ? DATA_POINT : null;
const getDdfParts = (fileParts: string[]) => {
  if (fileParts.length >= REQUIRED_DDF_FILE_PARTS && head(fileParts) === 'ddf') {
    return drop(fileParts);
  }

  return null;
};
const parseDdfFile = (rootFolder: string, folder: string, filename: string): IDdfFileDescriptor => {
  const partsByPoint: string[] = split(filename, '.');

  if (partsByPoint.length <= 1 || partsByPoint[1] !== CSV_EXTENSION) {
    return {valid: false};
  }

  const ddfParts = getDdfParts(split(head(partsByPoint), DDF_SEPARATOR));

  if (!ddfParts) {
    return {valid: false};
  }

  const type = getConceptType(ddfParts) ||
    getEntityType(ddfParts) ||
    getSynonymType(ddfParts) ||
    getDataPointType(ddfParts);

  if (!type) {
    return {valid: false};
  }

  const fullPath = resolve(folder, filename);

  return {
    valid: true,
    filename,
    name: head(partsByPoint),
    fullPath,
    rootFolder,
    type,
    parts: drop(ddfParts)
  };
};
const getActualSubDirectories = (folder: string, settings: any, onSubDirsReady: Function) => {
  walkDir(folder, (err: any, folders: string[]) => {
    if (err) {
      onSubDirsReady(err);
      return;
    }

    const excludeDirs = getExcludedDirs(settings);
    const actualFolders = folders.filter(folder => isPathExpected(folder, excludeDirs));

    actualFolders.push(folder);

    onSubDirsReady(null, actualFolders);
  })
};

let directoryIndex = 0;
let currentDir = null;
let prevDir = null;

export class DataPackage {
  public rootFolder: string;
  public errors: any[];
  public warnings: any[];
  public fileDescriptors: IDdfFileDescriptor[];
  public translationFolders: any[];
  public db: Db;
  public settings: any;
  public consistencyDescriptor: any;

  private dataPackageContent: any;
  private isNewDataPackage = false;

  constructor(rootFolder: string, settings: any) {
    this.rootFolder = rootFolder;
    this.settings = settings;
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];
    this.dataPackageContent = {};

    directoryIndex = 0;
    currentDir = null;
    prevDir = null;
  }

  getTranslationFileDescriptors(onTranslationsFileDescriptorsReady: Function) {
    readDir(resolve(this.rootFolder, LANG_FOLDER), (errFolders: any, translationFolders: any[]) => {
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
              this.settings,
              (folderErr: any, ddfTransFileDescriptors: any[] = []) => {
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

  fillConstraints(ddfFileDescriptor: IDdfFileDescriptor): IDdfFileDescriptor {
    if (ddfFileDescriptor.valid && ddfFileDescriptor.type === DATA_POINT) {
      const constraintsProcessing = (part: string): string => {
        const details = compact(split(part, '-'));

        if (details.length <= 1) {
          ddfFileDescriptor.valid = false;
          return null;
        }

        const correctedPart = head(details);

        ddfFileDescriptor.constraints[correctedPart] = tail(details);

        return correctedPart;
      };

      let isByWordPassed = false;

      ddfFileDescriptor.constraints = {};

      ddfFileDescriptor.parts.forEach((part: string, index: number) => {
        if (isByWordPassed && includes(part, '-')) {
          const correctedPart = constraintsProcessing(part);

          if (correctedPart) {
            ddfFileDescriptor.parts[index] = correctedPart;
          }
        }

        if (part === 'by') {
          isByWordPassed = true;
        }
      });
    }

    return ddfFileDescriptor;
  }

  getDdfFileDescriptors(folder: string, settings: any, onDdfFileDescriptorsReady: Function) {
    getActualSubDirectories(folder, settings, (dirErr: any, dirs: string[]) => {
      if (dirErr) {
        onDdfFileDescriptorsReady(dirErr);
        return;
      }

      const actions = dirs.map(dir => onDirRead => {
        readDir(dir, (err: any, files: string[] = []) => {
          const ddfFileDescriptors: IDdfFileDescriptor[] = files
            .map(file => this.fillConstraints(parseDdfFile(this.rootFolder, dir, file)))
            .filter(ddfFile => ddfFile.type);

          onDirRead(err, ddfFileDescriptors);
        });
      });

      parallelLimit(actions, PROCESS_LIMIT, (err, ddfFileDescriptors) => {
        const _ddfFileDescriptors: IDdfFileDescriptor[] = <IDdfFileDescriptor[]>compact(flatten(ddfFileDescriptors));

        for (let ddfFileDescriptor of _ddfFileDescriptors) {
          currentDir = path.dirname(ddfFileDescriptor.fullPath);

          if (directoryIndex === 0 || currentDir !== prevDir) {
            directoryIndex++;
          }

          prevDir = currentDir;
          ddfFileDescriptor.directoryIndex = directoryIndex;
        }

        onDdfFileDescriptorsReady(err, _ddfFileDescriptors);
      });
    });
  }

  fillHeaders(onHeadersReady: any) {
    const headerGetActions = this.fileDescriptors.map((fileDescriptor: IDdfFileDescriptor) => onHeaderReady => {
      getFileLine(fileDescriptor.fullPath, 0, (err, firstLine) => {
          fileDescriptor.headers = [];

          if (err) {
            return onHeaderReady();
          }

          const parsedFirstCsvLine = CsvParser.parse(firstLine);

          fileDescriptor.headers = head(parsedFirstCsvLine.data);
          onHeaderReady();
        }
      );
    });

    parallelLimit(headerGetActions, PROCESS_LIMIT, onHeadersReady);
  }

  fillPrimaryKeys(conceptTypeHash, conceptDomainHash) {
    const normalizePrimaryKey = (fileDescriptor: IDdfFileDescriptor): string[] => {
      if (typeof fileDescriptor.primaryKey === 'string') {
        return null;
      }

      return fileDescriptor.primaryKey.map(pkPart => {
        if (!includes(fileDescriptor.headers, pkPart)) {
          return conceptDomainHash[pkPart];
        }

        return pkPart;
      });
    };

    this.fileDescriptors.forEach(fileDescriptor => {
      if (fileDescriptor.type === CONCEPT) {
        fileDescriptor.primaryKey = CONCEPT_ID;
      }

      if (fileDescriptor.type === ENTITY) {
        const [domain, set] = fileDescriptor.parts;

        fileDescriptor.primaryKey = fileDescriptor.headers.indexOf(set) > -1 ? set : domain;
      }

      if (fileDescriptor.type === SYNONYM) {
        const entityDomain = fileDescriptor.headers.find(header => conceptTypeHash[header] === CONCEPT_TYPE_ENTITY_DOMAIN);
        const entitySet = fileDescriptor.headers.find(header => conceptTypeHash[header] === CONCEPT_TYPE_ENTITY_SET);

        fileDescriptor.primaryKey = [entityDomain || entitySet || CONCEPT_ID, SYNONYM_ID];
      }

      if (fileDescriptor.type === DATA_POINT) {
        const ddfDataPointSeparatorPos = indexOf(fileDescriptor.parts, DDF_DATAPOINT_SEPARATOR);
        const primaryKeyPartsCount = fileDescriptor.parts.length - ddfDataPointSeparatorPos - 1;

        fileDescriptor.primaryKey = takeRight(fileDescriptor.parts, primaryKeyPartsCount);
        fileDescriptor.primaryKey = normalizePrimaryKey(fileDescriptor);
      }
    });
  }

  getDataPackageObject() {
    if (!this.isNewDataPackage) {
      return this.dataPackageContent;
    }

    const rootFolderParts: string[] = split(this.rootFolder, sep);
    const packageName: string = last(rootFolderParts);
    const prepareField = (header: string, fileDescriptor: IDdfFileDescriptor): any => {
      const result: any = {name: header};

      if (fileDescriptor.constraints && fileDescriptor.constraints[header]) {
        result.constraints = {enum: fileDescriptor.constraints[header]};
      }

      return result;
    };
    const getRelativeDir = (fullPath: string) => {
      const relativeDir = path.relative(this.rootFolder, path.parse(fullPath).dir);

      return isEmpty(relativeDir) ? '' : `${relativeDir}/`;
    };
    // const stripDdfPrefix = filename => filename.replace(/ddf--(entities|datapoints)--/, '');
    const getNameSuffix = currentDirectoryIndex => currentDirectoryIndex === 1 ? '' : `-${currentDirectoryIndex}`;

    return {
      name: packageName || 'new_dataset',
      title: packageName || 'New Dataset',
      description: '',
      version: '0.0.1',
      language: {id: 'en', name: 'English'},
      translations: this.translationFolders
        .map(translation => ({id: translation, name: translation})),
      license: '',
      author: '',
      resources: this.fileDescriptors
        .map((fileDescriptor: IDdfFileDescriptor) => ({
          path: `${getRelativeDir(fileDescriptor.fullPath)}${fileDescriptor.filename}`,
          // name: `${stripDdfPrefix(fileDescriptor.name)}${getNameSuffix(fileDescriptor.directoryIndex)}`,
          name: `${fileDescriptor.name}${getNameSuffix(fileDescriptor.directoryIndex)}`,
          schema: {
            fields: (fileDescriptor.headers || []).map(header => prepareField(header, fileDescriptor)),
            primaryKey: fileDescriptor.primaryKey
          }
        })),
      ddfSchema: this.dataPackageContent.ddfSchema
    };
  }

  buildDataPackageResources(onDataPackageReady) {
    this.db = new Db();
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];

    this.getDdfFileDescriptors(this.rootFolder, this.settings, (ddfFileErr: any, ddfFileDescriptors: IDdfFileDescriptor[]) => {
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

              const conceptTypeHash = concept.getDictionary(null, CONCEPT_TYPE);
              const conceptDomainHash = concept.getDictionary(null, DOMAIN_ID);

              this.fillPrimaryKeys(conceptTypeHash, conceptDomainHash);

              validate(this.getDataPackageObject()).then(consistency => {
                this.consistencyDescriptor = consistency;

                if (!this.consistencyDescriptor.valid) {
                  return onDataPackageReady();
                }

                onDataPackageReady(this.getDataPackageObject());
              }).catch(err => {
                this.errors.push({
                  source: err.message,
                  reason: `${DATA_PACKAGE_FILE} frictionless validating`
                });

                onDataPackageReady();
              });
            });
          });
        }
      );
    });
  }

  read(onDataPackageReady) {
    this.errors = [];
    this.warnings = [];
    this.fileDescriptors = [];

    try {
      const content = readFileSync(resolve(this.rootFolder, DATA_PACKAGE_FILE), 'utf8');

      this.dataPackageContent = JSON.parse(content);
    } catch (contentErr) {
      this.errors.push({
        source: contentErr,
        reason: `${DATA_PACKAGE_FILE} parsing`
      });

      onDataPackageReady();
    }
    this.getTranslationFileDescriptors(
      (translationsErr, translationFolders) => {
        this.warnings.push({
          source: translationsErr,
          reason: 'translation file reading'
        });

        this.translationFolders = translationFolders || [];

        onDataPackageReady(this.dataPackageContent);
      });
  }

  setSchema(ddfSchema) {
    this.dataPackageContent.ddfSchema = ddfSchema;
  }

  getTranslations() {
    return this.dataPackageContent.translations || [];
  }

  take(onDataPackageReady: Function, ignoreExistingDataPackage: boolean) {
    const filePath = resolve(this.rootFolder, DATA_PACKAGE_FILE);

    this.isNewDataPackage = false;

    fileExists(filePath, (err, isExists) => {
      if (err || !isExists || ignoreExistingDataPackage) {
        if (err) {
          logger.error(err);
        }

        this.isNewDataPackage = true;
        this.buildDataPackageResources(dataPackage => onDataPackageReady(dataPackage));
      } else {
        this.read(dataPackage => {
          this.getDdfFileDescriptors(this.rootFolder, this.settings, (ddfFileErr: any, ddfFileDescriptors: IDdfFileDescriptor[]) => {
            if (ddfFileErr) {
              this.errors.push({
                source: ddfFileErr,
                reason: `${DATA_PACKAGE_FILE} processing`
              });

              return onDataPackageReady(dataPackage);
            }

            this.getTranslationFileDescriptors(
              (translationsErr, translationFolders) => {
                this.warnings.push({
                  source: translationsErr,
                  reason: 'translation file reading'
                });

                this.fileDescriptors = compact(ddfFileDescriptors);
                this.dataPackageContent = dataPackage;
                this.translationFolders = translationFolders || [];

                this.fillHeaders(headersError => {
                  if (headersError) {
                    this.errors.push({source: headersError, reason: 'headers reading'});
                  }

                  validate(this.getDataPackageObject()).then(consistency => {
                    this.consistencyDescriptor = consistency;

                    if (!this.consistencyDescriptor.valid) {
                      return onDataPackageReady();
                    }

                    onDataPackageReady(this.getDataPackageObject());
                  }).catch(err => {
                    this.errors.push({
                      source: err.message,
                      reason: `${DATA_PACKAGE_FILE} frictionless validation`
                    });

                    onDataPackageReady(dataPackage);
                  });
                });


              });

          });
        });
      }
    });
  }

  isValid() {
    return isEmpty(this.errors);
  }
}
