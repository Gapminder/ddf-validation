import {isEmpty} from 'lodash';
import {readFile} from 'fs';
import * as CsvParser from 'papaparse';

const getErrors = parsedCsv => parsedCsv.errors
  .filter(error => error.row >= 0)
  .map(error => ({
    message: error.message,
    row: error.row,
    type: `${error.type}/${error.code}`,
    data: parsedCsv.data[error.row]
  }));

export class CsvChecker {
  public filePath: string;
  public error: any;
  public errors: any[] = [];

  constructor(filePath) {
    this.filePath = filePath;
    this.error = null;
    this.errors = [];
  }

  check(onChecked) {
    readFile(this.filePath, 'utf-8', (err, fileContent) => {
      if (err) {
        onChecked();
        return;
      }

      CsvParser.parse(fileContent, {
        header: true,
        delimiter: ',',
        skipEmptyLines: true,
        complete: parsedCsv => {
          this.errors = getErrors(parsedCsv);
          onChecked();
        }
      });
    });
  }

  isCorrect() {
    return isEmpty(this.errors) && !this.error;
  }
}
