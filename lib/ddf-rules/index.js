'use strict';

const generalRules = require('./general-rules');
const conceptRules = require('./concept-rules');
const entityRules = require('./entity-rules');
const dataPackageRules = require('./data-package-rules');

module.exports = [
  generalRules,
  conceptRules,
  entityRules,
  dataPackageRules
];
