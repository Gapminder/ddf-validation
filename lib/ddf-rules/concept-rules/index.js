'use strict';

const registry = require('../registry');

const conceptIdIsNotUnique = require('./concept-id-is-not-unique');
const emptyConceptId = require('./empty-concept-id');
const nonConceptHeader = require('./non-concept-header');
const conceptMandatoryFieldNotFound = require('./concept-mandatory-field-not-found');
const conceptsNotFound = require('./concepts-not-found');
const invalidDrillUp = require('./invalid-drill-up');

module.exports = {
  [registry.CONCEPT_ID_IS_NOT_UNIQUE]: conceptIdIsNotUnique.rule,
  [registry.EMPTY_CONCEPT_ID]: emptyConceptId.rule,
  [registry.NON_CONCEPT_HEADER]: nonConceptHeader.rule,
  [registry.CONCEPT_MANDATORY_FIELD_NOT_FOUND]: conceptMandatoryFieldNotFound.rule,
  [registry.CONCEPTS_NOT_FOUND]: conceptsNotFound.rule,
  [registry.INVALID_DRILL_UP]: invalidDrillUp.rule
};
