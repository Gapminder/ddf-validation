'use strict';

const conceptRules = require('./concept-rules');
const entityRules = require('./entity-rules');
const indexRules = require('./index-rules');

module.exports = [
  conceptRules,
  entityRules,
  indexRules
];
