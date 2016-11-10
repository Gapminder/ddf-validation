'use strict';

const registry = require('../registry');

const nonUniqueEntityValue = require('./non-unique-entity-value');
const wrongEntityIsHeader = require('./wrong-entity-is-header');
const wrongEntityIsValue = require('./wrong-entity-is-value');

module.exports = {
  [registry.WRONG_ENTITY_IS_HEADER]: wrongEntityIsHeader.rule,
  [registry.WRONG_ENTITY_IS_VALUE]: wrongEntityIsValue.rule,
  [registry.NON_UNIQUE_ENTITY_VALUE]: nonUniqueEntityValue.rule
};
