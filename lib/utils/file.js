'use strict';
const path = require('path');
const fs = require('fs');
const csv = require('fast-csv');

/* eslint-disable */
const homeFolder = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
/* eslint-disable */

function copyFile(source, target, onFileCopied) {
  const rd = fs.createReadStream(source);
  const wr = fs.createWriteStream(target);

  let cbCalled = false;

  rd.on('error', err => done(err));
  wr.on('error', err => done(err));
  wr.on('close', () => done());

  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      onFileCopied(err);
      cbCalled = true;
    }
  }
}

function norm(folder) {
  let normFolder = folder;
  if (folder.indexOf('~') !== -1) {
    normFolder = path.join(homeFolder, folder.replace('~', ''));
  }

  return path.resolve(normFolder);
}

function read(_dir, done) {
  const dir = norm(_dir);

  fs.readdir(dir, (err, list) => {
    if (err) {
      return done(err);
    }

    done(null, list);
  });
}

function walk(_dir, done) {
  const dir = norm(_dir);
  let results = [];

  fs.readdir(dir, (err, list) => {
    if (err) {
      return done(err);
    }

    let pending = list.length;
    if (!pending) {
      return done(null, results);
    }

    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          results.push(file);

          walk(file, (err, res) => {
            results = results.concat(res);

            if (!--pending) {
              done(null, results);
            }
          });
        }

        if (!stat || !stat.isDirectory()) {
          if (!--pending) {
            done(null, results);
          }
        }
      });
    });
  });
}

function writeFile(path, content, onFileWrote) {
  fs.writeFile(path, content, err => {
    if (err) {
      return onFileWrote(err);
    }

    onFileWrote();
  });
}

function getFileLine(filename, lineNo, callback) {
  const stream = fs.createReadStream(filename, {
    flags: 'r',
    encoding: 'utf-8',
    fd: null,
    bufferSize: 64 * 1024
  });

  let fileData = '';

  stream.on('data', function (data) {
    fileData += data;

    const lines = fileData.split("\n");

    if (lines.length >= +lineNo) {
      stream.destroy();
      callback(null, lines[+lineNo]);
    }
  });

  stream.on('error', function () {
    callback('Error', null);
  });

  stream.on('end', function () {
    callback('File end reached without finding line', null);
  });
}

function readFile(filePath, onFileRead) {
  const fileStream = fs.createReadStream(filePath);
  const content = [];

  fileStream.on('error', err => onFileRead(err));

  csv
    .fromStream(fileStream, {headers: true})
    .on('data', ddfRecord => content.push(ddfRecord))
    .on('end', () => onFileRead(null, content));
}

function walkFile(filePath, onLineRead, onFileRead) {
  const fileStream = fs.createReadStream(filePath);

  let line = 0;

  fileStream.on('error', err => onFileRead(err));

  csv
    .fromStream(fileStream, {headers: true})
    .on('data', ddfRecord => onLineRead(ddfRecord, line++))
    .on('end', () => onFileRead());
}

function backupFile(filePath, onBackupCreated) {
  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      throw statErr;
    }

    if (stats.isFile()) {
      copyFile(filePath, filePath + '.backup', fileErr => {
        if (fileErr) {
          throw fileErr;
        }

        onBackupCreated();
      });
    }
  });
}

exports.norm = norm;
exports.walkDir = walk;
exports.readDir = read;
exports.writeFile = writeFile;
exports.getFileLine = getFileLine;
exports.readFile = readFile;
exports.walkFile = walkFile;
exports.backupFile = backupFile;