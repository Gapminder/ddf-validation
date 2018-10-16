import { parallelLimit } from 'async';
import { isArray, includes, compact, isEmpty } from 'lodash';
import { stat } from 'fs';
import { getFileLine } from '../utils/file';
import { INCORRECT_FILE } from '../ddf-rules/registry';
import { CsvChecker } from './csv-checker';
import { logger } from '../utils';

const PROCESS_LIMIT = 10;

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
  public translationId: boolean;
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
    this.translationId = data.translationId;
    this.isTranslation = data.isTranslation;
  }

  fillHeaders(onHeadersReady) {
    getFileLine(this.fullPath, 0, (err, line) => {
      if (err) {
        onHeadersReady(err);
        return;
      }

      this.headers = line.split(',').map(header => header.trim().replace(/^"|"$/g, ''));

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
    this.checkFile((fileStateDescriptor) => {
      if (!fileStateDescriptor.ok) {
        this.issues.push(fileStateDescriptor);
        return onFileDescriptorChecked([fileStateDescriptor]);
      }

      getFileLine(this.fullPath, 1, (lineErr, line) => {
        if (lineErr) {
          logger.error(lineErr);
        }

        const fileAttributesContainer = fileStateDescriptor;

        this.hasFirstLine = !lineErr && !!line;

        if (fileAttributesContainer && fileAttributesContainer.stats) {
          this.size = fileAttributesContainer.stats.size;
        }

        this.csvChecker.check(() => {
          logger.progress();
          return onFileDescriptorChecked();
        });

        logger.progress();
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

  private checkFile(onFileChecked: Function) {
    stat(this.fullPath, (err: any, stats) => {
      if (err) {
        onFileChecked({
          type: INCORRECT_FILE,
          fullPath: this.fullPath,
          data: err.message
        });
        return;
      }

      if (!stats.isFile()) {
        onFileChecked({
          type: INCORRECT_FILE,
          fullPath: this.fullPath,
          data: `${this.fullPath} is not a file`
        });
        return;
      }

      onFileChecked({ok: true, stats});
    });
  }
}
