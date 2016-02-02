'use strict';
const fs = require('fs');
const Rx = require('rxjs');
const path = require('path');
const Observable = Rx.Observable;

const readdir$ = Observable.bindNodeCallback(fs.readdir);

module.exports = folder =>
  readdir$(folder)
    .switch()
    .filter(subfolder => fs.statSync(path.join(folder, subfolder)).isFile())
    .map(subfolder => path.join(folder, subfolder));