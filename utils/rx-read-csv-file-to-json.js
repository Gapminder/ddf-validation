'use strict';

const fs = require('fs');
const Rx = require('rxjs');
const parse = require('csv-parse');
var Subject = Rx.Subject;

module.exports = function (filePath) {
  const subject = new Subject();
  const parser = parse({});
  let record, output = [];

  parser.on('readable', function () {
    while (record = parser.read()) {
      // [val1, val2, ...]
      subject.next(record);
    }
  });
  parser.on('error', function (err) {
    subject.error(err);
  });
  parser.on('finish', function () {
    subject.complete(output);
  });

  fs.createReadStream(filePath).pipe(parser);
  return subject;
};