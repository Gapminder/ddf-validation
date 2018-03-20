import * as path from 'path';
import * as CsvParser from 'papaparse';
import {
  head,
  cloneDeep,
  drop,
  split,
  isArray,
  indexOf,
  flatten,
  last,
  includes,
  compact,
  isEmpty,
  takeRight,
  tail
} from 'lodash';
import { readFile } from 'fs';
import { parallelLimit } from 'async';
import { resolve, sep } from 'path';
import {
  CONCEPT,
  ENTITY,
  DATA_POINT,
  DDF_SEPARATOR,
  DDF_DATAPOINT_SEPARATOR
} from '../ddf-definitions/constants';
import { Db } from '../data/db';
import { Concept } from '../ddf-definitions/concept';
import { readDir, getFileLine, writeFile, fileExists, walkDir } from '../utils/file';
import { getDdfSchema } from './ddf-schema';
import { getExcludedDirs, isPathExpected } from './shared';
import { CONCEPT_TYPE_ENTITY_DOMAIN, CONCEPT_TYPE_ENTITY_SET } from '../utils/ddf-things';

export interface IDdfFileDescriptor {
  valid: boolean;
  filename?: string;
  name?: string;
  fullPath?: string;
  type?: symbol;
  parts?: string[];
  constraints?: any;
  headers?: string[];
  primaryKey?: string | string[];
  directoryIndex?: number
}

export const DATA_PACKAGE_FILE = 'datapackage.json';

const PROCESS_LIMIT = 5;
const CONCEPT_ID = 'concept';
const LANG_FOLDER = 'lang';
const CSV_EXTENSION = 'csv';
const REQUIRED_DDF_FILE_PARTS = 2;

const getConceptType = (fileParts: string[]) => head(fileParts) === 'concepts' ? CONCEPT : null;
const getEntityType = (fileParts: string[]) => head(fileParts) === 'entities' ? ENTITY : null;
const getDataPointType = (fileParts: string[]) => head(fileParts) === 'datapoints' ? DATA_POINT : null;
const getDdfParts = (fileParts: string[]) => {
  if (fileParts.length >= REQUIRED_DDF_FILE_PARTS && head(fileParts) === 'ddf') {
    return drop(fileParts);
  }

  return null;
};
const parseDdfFile = (folder: string, filename: string): IDdfFileDescriptor => {
  const partsByPoint: string[] = split(filename, '.');

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

  const fullPath = resolve(folder, filename);

  return {
    valid: true,
    filename,
    name: head(partsByPoint),
    fullPath,
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
  public fileDescriptorsHash: Map<string, IDdfFileDescriptor>;
  public dataPackageContent: any;
  public translationFolders: any[];
  public db: Db;
  public settings: any;

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
            .map(file => this.fillConstraints(parseDdfFile(dir, file)))
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

  fillPrimaryKeys(conceptTypeHash) {
    this.fileDescriptors
      .forEach(fileDescriptor => {
        if (fileDescriptor.type === CONCEPT) {
          fileDescriptor.primaryKey = 'concept';
        }

        if (fileDescriptor.type === ENTITY) {
          const entityDomain = fileDescriptor.headers.find(header => conceptTypeHash[header] === CONCEPT_TYPE_ENTITY_DOMAIN);
          const entitySet = fileDescriptor.headers.find(header => conceptTypeHash[header] === CONCEPT_TYPE_ENTITY_SET);

          fileDescriptor.primaryKey = entityDomain || entitySet;
        }

        if (fileDescriptor.type === DATA_POINT) {
          const ddfDataPointSeparatorPos = indexOf(fileDescriptor.parts, DDF_DATAPOINT_SEPARATOR);
          const primaryKeyPartsCount = fileDescriptor.parts.length - ddfDataPointSeparatorPos - 1;

          fileDescriptor.primaryKey = takeRight(fileDescriptor.parts, primaryKeyPartsCount);
        }
      });
  }

  getDataPackageObject() {
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
    const stripDdfPrefix = filename => filename.replace(/ddf--(entities|datapoints)--/, '');
    const getNameSuffix = currentDirectoryIndex => currentDirectoryIndex === 1 ? '' : `-${currentDirectoryIndex}`;

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
        .map((fileDescriptor: IDdfFileDescriptor) => ({
          path: `${getRelativeDir(fileDescriptor.fullPath)}${fileDescriptor.filename}`,
          name: `${stripDdfPrefix(fileDescriptor.name)}${getNameSuffix(fileDescriptor.directoryIndex)}`,
          schema: {
            fields: (fileDescriptor.headers || []).map(header => prepareField(header, fileDescriptor)),
            primaryKey: fileDescriptor.primaryKey
          }
        }))
    };
  }

  getType(filename) {
    const normalizedFileName = path.resolve(this.rootFolder, filename);

    if (!this.fileDescriptorsHash) {
      this.fileDescriptorsHash = new Map<string, IDdfFileDescriptor>();

      this.fileDescriptors.forEach(fileDescriptor => {
        this.fileDescriptorsHash.set(path.resolve(this.rootFolder, fileDescriptor.fullPath), fileDescriptor);
      });
    }

    return this.fileDescriptorsHash.get(normalizedFileName).type;
  }

  build(onDataPackageReady) {
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

              const conceptTypeHash = concept.getDictionary(null, 'concept_type');

              this.fillPrimaryKeys(conceptTypeHash);
              this.dataPackageContent = this.getDataPackageObject();

              onDataPackageReady(this.dataPackageContent);
            });
          });
        }
      );
    });
  }

  write(settings: any, existingDataPackage: any, onDataPackageFileReady: Function) {
    const dateLabel = new Date().toISOString().replace(/:/g, '');
    const isBasedOnCurrentDataPackage =
      (existingDataPackage && (settings.updateDataPackageTranslations || settings.updateDataPackageContent));
    const fileName = isBasedOnCurrentDataPackage || !existingDataPackage ? DATA_PACKAGE_FILE : `${DATA_PACKAGE_FILE}.${dateLabel}`;
    const filePath = resolve(this.rootFolder, fileName);
    const commandLineSettings = cloneDeep(this.settings);

    commandLineSettings.isProgressNeeded = true;

    getDdfSchema(this, commandLineSettings, (ddfSchema: any) => {
      const contentToOut = cloneDeep(isBasedOnCurrentDataPackage ? existingDataPackage : this.dataPackageContent);

      if (settings.updateDataPackageTranslations) {
        contentToOut.translations = this.dataPackageContent.translations;
      }

      if (settings.updateDataPackageContent) {
        contentToOut.resources = this.dataPackageContent.resources;
        contentToOut.ddfSchema = ddfSchema;
      }

      if (!isBasedOnCurrentDataPackage) {
        contentToOut.ddfSchema = ddfSchema;
      }

      const content = settings.compressDatapackage ?
        JSON.stringify(contentToOut) : JSON.stringify(contentToOut, null, 2);

      writeFile(filePath, content, err => onDataPackageFileReady(err, filePath));
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
          this.dataPackageContent = JSON.parse(content);
          this.getTranslationFileDescriptors(
            (translationsErr, translationFolders) => {
              this.warnings.push({
                source: translationsErr,
                reason: 'translation file reading'
              });

              this.translationFolders = translationFolders || [];

              onDataPackageReady(this.dataPackageContent);
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
    return this.dataPackageContent.resources;
  }

  getSchema() {
    return this.dataPackageContent.ddfSchema;
  }

  getTranslations() {
    return this.dataPackageContent.translations || [];
  }

  take(onDataPackageReady: Function, ignoreExistingDataPackage: boolean) {
    const filePath = resolve(this.rootFolder, DATA_PACKAGE_FILE);

    fileExists(filePath, (err, isExists) => {
      if (err || !isExists || ignoreExistingDataPackage) {
        this.build(dataPackage => onDataPackageReady(dataPackage));
        return;
      }

      this.read(dataPackage => {
        this.fileDescriptors = dataPackage.resources.map(resource => ({
          filename: resource.path,
          name: resource.name,
          schema: resource.schema,
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
