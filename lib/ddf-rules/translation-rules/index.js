'use strict';

const registry = require('../registry');
const unexpectedTranslationHeader = require('./unexpected-translation-header');
const unexpectedTranslationsData = require('./unexpected-translations-data');

module.exports = {
  [registry.UNEXPECTED_TRANSLATION_HEADER]: unexpectedTranslationHeader.rule,
  [registry.UNEXPECTED_TRANSLATIONS_DATA]: unexpectedTranslationsData.rule
};
