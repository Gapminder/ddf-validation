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

exports.norm = norm;
exports.walkDir = walk;
exports.readDir = read;
