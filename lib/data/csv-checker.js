'use strict';

const _ = require('lodash');
const fs = require('fs');
const CsvParser = require('babyparse');

const getErrors = parsedCsv => parsedCsv.errors
  .filter(error => error.row >= 0)
  .map(error => ({
    message: error.message,
    row: error.row,
    type: `${error.type}/${error.code}`,
    data: parsedCsv.data[error.row]
  }));

class CsvChecker {
  constructor(filePath) {
    this.filePath = filePath;
    this.error = null;
    this.errors = [];
  }

  check(onChecked) {
    fs.readFile(this.filePath, 'utf-8', (err, fileContent) => {
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
    return _.isEmpty(this.errors);
  }
}

module.exports = CsvChecker;
