module.exports = {
  // 0 - file name
  // 1 - measure gid
  // 2 - dimensions
  //        000000000000000011111112222222222222222222222222222222000000
  fileExp: /^ddf--data_for--([\w]+)(?:--by((?:--(?:[\w]+))+)){0,1}\.csv$/i,
  dimensions: (fileName) => (this.fileExp.exec(fileName)[2] || '').split('--').splice(1),
  measure: (fileName) => (this.fileExp.exec(fileName)[1] || '').split('--').splice(1)
};
