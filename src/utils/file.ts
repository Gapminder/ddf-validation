import { join, resolve } from 'path';
import { createReadStream, createWriteStream, readdir, stat, writeFile as writeFileFs } from 'fs';
import { isPathExpected } from '../data/shared';

const stripBom = require('strip-bom');
const csv = require('fast-csv');
const END_OF_LINE = require('os').EOL;

/* eslint-disable */
const homeFolder = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;

/* eslint-disable */

function copyFile(source, target, onFileCopied) {
  const rd = createReadStream(source);
  const wr = createWriteStream(target);

  let cbCalled = false;

  rd.on('error', err => done(err));
  wr.on('error', err => done(err));
  wr.on('close', done);

  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      onFileCopied(err);
      cbCalled = true;
    }
  }
}

export function norm(folder) {
  let normFolder = folder;
  if (folder.indexOf('~') !== -1) {
    normFolder = join(homeFolder, folder.replace('~', ''));
  }

  return resolve(normFolder);
}

export function readDir(_dir, done) {
  const dir = norm(_dir);

  readdir(dir, (err, list) => {
    if (err) {
      return done(err);
    }

    done(null, list);
  });
}

export function walkDir(_dir, done) {
  const dir = norm(_dir);

  let results = [];

  readdir(dir, (err, list) => {
    if (err || !isPathExpected(dir)) {
      return done(err, []);
    }

    let pending = list.length;

    if (!pending) {
      return done(null, results);
    }

    list.forEach(file => {
      file = resolve(dir, file);
      stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          results.push(file);

          walkDir(file, (err, res) => {
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

export function writeFile(path, content, onFileWrote) {
  writeFileFs(path, content, err => {
    if (err) {
      return onFileWrote(err);
    }

    onFileWrote();
  });
}

export function getFileLine(filename, lineNo, callback) {
  const options: any = {
    flags: 'r',
    encoding: 'utf-8',
    fd: null,
    bufferSize: 64 * 1024
  };
  const stream = createReadStream(filename, options);

  let fileData = '';

  stream.on('data', data => {
    fileData += stripBom(data);

    const lines = fileData.split(END_OF_LINE);

    if (lines.length >= +lineNo) {
      stream.destroy();
      stream.close();
      callback(null, lines[+lineNo]);
    }
  });

  stream.on('error', err => {
    callback(err, null);
  });

  stream.on('end', () => {
    stream.close();
    callback('File end reached without finding line', null);
  });
}

export function readFile(filePath, onFileRead) {
  const content = [];

  csv
    .fromPath(filePath, {headers: true})
    .on('data', ddfRecord => content.push(ddfRecord))
    .on('end', () => {
      onFileRead(null, content);
    });
}

export function walkFile(filePath, onLineRead, onFileRead) {
  let line = 0;

  csv
    .fromPath(filePath, {headers: true})
    .on('data', ddfRecord => onLineRead(ddfRecord, line++))
    .on('end', () => {
      onFileRead();
    });
}

export function backupFile(filePath, onBackupCreated) {
  stat(filePath, (statErr, stats) => {
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

export function fileExists(file, onFileChecked) {
  stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        onFileChecked(null, false);
        return
      }
      onFileChecked(err);
      return;
    }

    onFileChecked(null, stats.isFile());
  });
}
