'use strict';

const registry = require('../registry');
const unexpectedDataPointTranslationsData =
  require('./unexpected-data-point-translations-data');

module.exports = {[registry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: unexpectedDataPointTranslationsData.rule};
