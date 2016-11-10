'use strict';

const registry = require('../registry');
const incorrectFile = require('./incorrect-file');
const confusedFields = require('./confused-fields');
const nonConceptPrimaryKey = require('./non-concept-primary-key');
const nonUniqueResourceName = require('./non-unique-resource-name');
const nonUniqueResourceFile = require('./non-unique-resource-file');

module.exports = {
  [registry.INCORRECT_FILE]: incorrectFile.rule,
  [registry.DATAPACKAGE_CONFUSED_FIELDS]: confusedFields.rule,
  [registry.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY]: nonConceptPrimaryKey.rule,
  [registry.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: nonUniqueResourceName.rule,
  [registry.DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: nonUniqueResourceFile.rule
};
