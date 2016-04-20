'use strict';

const generalRules = require('./general-rules');
const conceptRules = require('./concept-rules');
const entityRules = require('./entity-rules');
const indexRules = require('./index-rules');

module.exports = [
  generalRules,
  conceptRules,
  entityRules,
  indexRules
];
