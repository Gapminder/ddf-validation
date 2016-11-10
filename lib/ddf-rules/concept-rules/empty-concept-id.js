'use strict';

const registry = require('../registry');
const Issue = require('../issue');

module.exports = {
  rule: ddfDataSet =>
    ddfDataSet
      .getConcept()
      .getAllData()
      .filter(conceptRecord => !conceptRecord.concept)
      .map(conceptRecordWithEmptyId =>
        new Issue(registry.EMPTY_CONCEPT_ID)
          .setPath(conceptRecordWithEmptyId.$$source)
          .setData({line: conceptRecordWithEmptyId.$$lineNumber})
      )
};
