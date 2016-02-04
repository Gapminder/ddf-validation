module.exports = {
  // 0 - file name
  // 1 - dimensions
  //        0000000000111111111111100000
  fileExp: /^ddf--list((?:--\w+)+)\.csv$/i,
  dimensions: (fileName) => (this.fileExp.exec(fileName)[2] || '').split('--').splice(1)
};
