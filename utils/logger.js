'use strict';

const util = require('util');
let winston = require('winston');
const GENERIC_MODE = Symbol('generic mode');
const UI_MODE = Symbol('ui mode');

const profiles = {
  [GENERIC_MODE]: class {
    notice(level, msg, meta, callback) {
      console.log(msg);
      callback(null, true);
    }

    results(level, msg, meta, callback) {
      console.log(meta);
      callback(null, true);
    }
  },
  [UI_MODE]: class {
    constructor() {
      this.ui = require('../ui');
    }

    notice(level, msg, meta, callback) {
      this.ui.addMessage(msg, level);
      callback(null, true);
    }

    results(level, msg, meta, callback) {
      this.ui.addResults(meta);
      callback(null, true);
    }
  }
};

module.exports = (settings) => {
  // always use console mode for tests: global.it checking
  const mode = settings.isUI && typeof global.it !== 'function' ? UI_MODE : GENERIC_MODE;
  const expectedProfile = new profiles[mode]();

  let diagnosticLogger = function () {
    this.name = 'diagnosticLogger';
    this.level = 'error';
  };
  util.inherits(diagnosticLogger, winston.Transport);
  diagnosticLogger.prototype.log = function (level, msg, meta, callback) {
    expectedProfile.notice(level, msg, meta, callback);
  };

  let resultsLogger = function () {
    this.name = 'resultsLogger';
    this.level = 'results';
  };
  util.inherits(resultsLogger, winston.Transport);
  resultsLogger.prototype.log = function (level, msg, meta, callback) {
    expectedProfile.results(level, msg, meta, callback);
  };

  var logger = new (winston.Logger)({
    levels: {trace: 0, results: 1, notice: 2, warning: 3, error: 4},
    transports: [
      new diagnosticLogger(),
      new resultsLogger()
    ]
  });

  return logger;
};
