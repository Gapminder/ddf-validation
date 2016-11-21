'use strict';

const generalRules = require('./general-rules');
const conceptRules = require('./concept-rules');
const entityRules = require('./entity-rules');
const dataPackageRules = require('./data-package-rules');
const dataPointRules = require('./data-point-rules');
const translationRules = require('./translation-rules');

module.exports = Object.assign({},
  generalRules,
  conceptRules,
  entityRules,
  dataPackageRules,
  dataPointRules,
  translationRules
);
