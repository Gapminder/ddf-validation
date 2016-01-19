'use strict';
const path = require('path');

const homeFolder = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

module.exports = folder => {
  let normFolder = folder;
  if (folder.indexOf('~') !== -1) {
    normFolder = path.join(homeFolder, folder.replace('~', ''));
  }
  return path.resolve(normFolder);
};


