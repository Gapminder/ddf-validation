import * as fs from 'fs';

const csv = require('fast-csv');

export function csvToJson(path, cb) {
  const result = [];
  const fileStream = fs.createReadStream(path);

  fileStream.on('error', error => cb(error));

  csv
    .fromStream(fileStream, {headers: true})
    .on('data', data => result.push(data))
    .on('end', () => cb(null, result));
}

export function csvToJsonByString(jsonStr, cb) {
  const result = [];

  csv
    .fromString(jsonStr, {headers: true})
    .on('data', data => result.push(data))
    .on('end', () => cb(null, result));
}
