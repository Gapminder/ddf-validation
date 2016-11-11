'use strict';

const registry = require('../registry');
const unexpectedTranslationHeader = require('./unexpected-translation-header');

module.exports = {[registry.UNEXPECTED_TRANSLATION_HEADER]: unexpectedTranslationHeader.rule};
