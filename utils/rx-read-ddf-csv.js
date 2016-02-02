'use strict';
const fs = require('fs');
const Rx = require('rxjs');
const path = require('path');

const readCsvFileToJson = require('../utils/rx-read-csv-file-to-json');
const logger = require('../utils/logger');

const Subject = Rx.Subject;
const Observable = Rx.Observable;
const stat$ = Observable.bindNodeCallback(fs.stat);

module.exports = (folderPath, fileName) => {
  const subject = new Subject();
  const filePath = path.join(folderPath, fileName);

  stat$(filePath)
  // proceed only if file exists
    .subscribe(() => {
      logger.log(`reading ${fileName} from ${folderPath}`);
      // read csv file
      readCsvFileToJson(filePath).subscribe(subject);
    }, () => {
      logger.log(`file ${fileName} not found in ${folderPath}`);
      subject.next(null);
      subject.complete();
    });

  return subject;
};
