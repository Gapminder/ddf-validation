'use strict';
const fs = require('fs');
let cache = new Map();
module.exports = path => {
  if (cache.has(path)) {
    return cache.get(path);
  }

  try {
    cache.set(path, !!fs.statSync(path));
    return cache.get(path, true);
  } catch (e) {
    cache.set(path, false);
    return false;
  }
};
