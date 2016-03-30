'use strict';
const path = require('path');
const fs = require('fs');
/* eslint-disable */
const homeFolder = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
/* eslint-disable */

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

function writeFile(path, content, cb) {
  fs.writeFile(path, content, err => {
    if (err) {
      return cb(err);
    }

    cb();
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

exports.norm = norm;
exports.walkDir = walk;
exports.readDir = read;
exports.writeFile = writeFile;
exports.getFileLine = getFileLine;
