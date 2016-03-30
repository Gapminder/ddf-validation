'use strict';

const util = require('util');
const winston = require('winston');
const CONSOLE_MODE = Symbol.for('CONSOLE_MODE');
const UI_MODE = Symbol.for('UI_MODE');

const profiles = {
  [CONSOLE_MODE]: class {

    /*eslint max-params: [1, 4] */
    /*eslint no-console: [2, { allow: ["log"] }] */
    notice(level, msg, meta, callback) {
      console.log(msg);
      callback(null, true);
    }
  }
};

module.exports = settings => {
  // always use console mode for tests: global.it checking
  const mode = settings.isUI && typeof global.it !== 'function' ? UI_MODE : CONSOLE_MODE;
  const expectedProfile = new profiles[mode]();

  function CustomTransport() {
    this.name = 'CustomTransport';
    this.level = 'error';
  }

  util.inherits(CustomTransport, winston.Transport);
  CustomTransport.prototype.log = (level, msg, meta, callback) => {
    expectedProfile.notice(level, msg, meta, callback);
  };

  return new winston.Logger({
    levels: {trace: 0, results: 1, notice: 2, warning: 3, error: 4},
    transports: [
      new CustomTransport()
    ]
  });
};
