'use strict';
const csv = require('fast-csv');
const fs = require('fs');

function csvToJson(path, cb) {
  const result = [];
  const fileStream = fs.createReadStream(path);

  fileStream.on('error', error => cb(error));

  csv
    .fromStream(fileStream, {headers: true})
    .on('data', data => result.push(data))
    .on('end', () => cb(null, result));
}

function csvToJsonByString(jsonStr, cb) {
  const result = [];

  csv
    .fromString(jsonStr, {headers: true})
    .on('data', data => result.push(data))
    .on('end', () => cb(null, result));
}


exports.csvToJson = csvToJson;
exports.csvToJsonByString = csvToJsonByString;
