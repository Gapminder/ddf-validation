#! /usr/bin/env node
'use strict';

require('ts-node').register({
  ignore: ['2304', '2345', '2453'],
  compilerOptions: {"target": "es6"}
});
require('./cli-logic');
