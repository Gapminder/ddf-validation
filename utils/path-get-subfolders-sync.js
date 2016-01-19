'use strict';
const fs = require('fs');
const path = require('path');

module.exports = folder =>
  fs.readdirSync(folder)
    .filter(subfolder => fs.statSync(path.join(folder, subfolder)).isDirectory())
    .map(subfolder => path.join(folder, subfolder));
