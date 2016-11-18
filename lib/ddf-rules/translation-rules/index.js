'use strict';

const registry = require('../registry');
const unexpectedTranslationHeader = require('./unexpected-translation-header');
const unexpectedTranslationsData = require('./unexpected-translations-data');
const unexpectedDataPointTranslationsData = require('./unexpected-data-point-translations-data');
const duplicatedDataPointTranslationKey = require('./duplicated-data-point-translation-key');
const duplicatedTranslationKey = require('./duplicated-translation-key');

module.exports = {
  [registry.UNEXPECTED_TRANSLATION_HEADER]: unexpectedTranslationHeader,
  [registry.UNEXPECTED_TRANSLATIONS_DATA]: unexpectedTranslationsData,
  [registry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: unexpectedDataPointTranslationsData,
  [registry.DUPLICATED_DATA_POINT_TRANSLATION_KEY]: duplicatedDataPointTranslationKey,
  [registry.DUPLICATED_TRANSLATION_KEY]: duplicatedTranslationKey
};
