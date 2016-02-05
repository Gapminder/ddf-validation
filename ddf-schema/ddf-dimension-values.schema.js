module.exports = {
  // 0 - file name
  // 1 - dimensions
  //        0000000000111111111111100000
  fileExp: /^ddf--list((?:--\w+)+)\.csv$/i,
  dimensions: function (fileName) {
    return (this.fileExp.exec(fileName)[1] || '').split('--').splice(1);
  }
};
