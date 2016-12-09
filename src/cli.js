#! /usr/bin/env node
'use strict';

require('ts-node').register({
  compilerOptions: {"target": "es6"}
});
require('./cli-logic');
