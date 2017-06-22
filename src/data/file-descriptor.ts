import { parallelLimit } from 'async';
import { isArray, includes, compact, isEmpty } from 'lodash';
import { stat } from 'fs';
import { getFileLine } from '../utils/file';
import { INCORRECT_FILE } from '../ddf-rules/registry';
import { CsvChecker } from './csv-checker';

const PROCESS_LIMIT = 30;

function getIssueCases(fileDescriptor) {
  return [
    cb => {
      stat(fileDescriptor.fullPath, (err: any, stats) => {
        if (err) {
          cb(null, {
            type: INCORRECT_FILE,
            data: err.message,
            path: fileDescriptor.fullPath
          });
          return;
        }

        if (!stats.isFile()) {
          cb(null, {
            type: INCORRECT_FILE,
            data: `${fileDescriptor.fullPath} is not a file`,
            path: fileDescriptor.fullPath
          });
          return;
        }

        cb(null, {ok: true, stats});
      });
    }
  ];
}

export class FileDescriptor {
  public dir: string;
  public file: string;
  public type: any;
  public primaryKey: string[];
  public headers: string[];
  public issues: any[];
  public transFileDescriptors: FileDescriptor[];
  public content: any;
  public measures: string[];
  public fullPath: string;
  public csvChecker: CsvChecker;
  public hasFirstLine: boolean;
  public isTranslation: boolean;
  public size: number;

  constructor(data) {
    this.dir = data.dir;
    this.file = data.file;
    this.type = data.type;
    this.primaryKey = data.primaryKey;
    this.headers = this.issues = this.transFileDescriptors = this.content = [];
    this.measures = data.measures;
    this.fullPath = data.fullPath;
    this.csvChecker = new CsvChecker(this.fullPath);
    this.hasFirstLine = false;
    this.isTranslation = data.isTranslation;
  }

  fillHeaders(onHeadersReady) {
    getFileLine(this.fullPath, 0, (err, line) => {
      if (err) {
        onHeadersReady(err);
        return;
      }

      this.headers = line.split(',').map(header => header.trim());

      onHeadersReady();
    });
  }

  is(type) {
    if (!isArray(type)) {
      return type === this.type;
    }

    return includes(type, this.type);
  }

  check(onFileDescriptorChecked) {
    parallelLimit(getIssueCases(this), PROCESS_LIMIT, (err, results) => {
      if (err) {
        throw err;
      }

      getFileLine(this.fullPath, 1, (lineErr, line) => {
        const fileAttributesContainer: any = results.find((result: any) => result.ok);

        this.hasFirstLine = !lineErr && !!line;
        this.issues = compact(results.filter((result: any) => !result.ok));

        if (fileAttributesContainer && fileAttributesContainer.stats) {
          this.size = fileAttributesContainer.stats.size;
        }

        if (isEmpty(this.issues)) {
          this.csvChecker.check(() => onFileDescriptorChecked());

          return;
        }

        onFileDescriptorChecked(this.issues);
      });
    });
  }

  checkTranslations(onTranslationsChecked) {
    const transFileActions = this.transFileDescriptors.map(transFileDescriptor => onTransFileReady => {
      transFileDescriptor.check(err => {
        if (err) {
          onTransFileReady();
          return;
        }

        transFileDescriptor.fillHeaders(onTransFileReady);
      });
    });

    parallelLimit(transFileActions, PROCESS_LIMIT, onTranslationsChecked);
  }

  getExistingTranslationDescriptors() {
    return this.transFileDescriptors.filter(transFileDescriptor => isEmpty(transFileDescriptor.issues));
  }
}
