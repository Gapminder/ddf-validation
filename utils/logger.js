'use strict';

//module.exports.log = console.log.bind(console);

const ui = require('../ui');
const globals = require('../ui/globals');

function log(out, level) {
  if (out && typeof out !== 'string' && out.toString) {
    out = out.toString();
  }

  ui.addMessage(out, level || globals.NOTICE);
}

module.exports.log = (out) => {
  log(out);
};

module.exports.error = (out) => {
  log(out, globals.ERROR)
};

module.exports.warning = (out) => {
  log(out, globals.WARNING);
};

module.exports.results = (data) => {
  ui.addResults(data);
};
