'use strict';

const _ = require('lodash');
const Levenshtein = require('levenshtein');
const registry = require('../registry');
const Issue = require('../issue');
const SUGGEST_TOLERANCE = 5;
const IS_HEADER_PREFIX = 'is--';

module.exports = {
  rule: ddfDataSet => {
    const result = [];
    const conceptIds = ddfDataSet.getConcept().getIds();
    const entitySetIds = ddfDataSet.getConcept().getDataIdsByType('entity_set');

    function getInformationAboutNonConcept(actualHeaderDetail, headerDetail) {
      return _.includes(conceptIds, actualHeaderDetail) ? null : {
        message: 'Not a concept',
        headerDetail
      };
    }

    function getInformationAboutWrongConcept(actualHeaderDetail, headerDetail) {
      const conceptRecord = ddfDataSet.getConcept().getRecordByKey(actualHeaderDetail);

      return !conceptRecord || conceptRecord.concept_type !== 'entity_set' ? {
        message: 'Wrong concept type',
        headerDetail
      } : null;
    }

    ddfDataSet.getEntity().fileDescriptors.forEach(fileDescriptor => {
      fileDescriptor.headers.forEach(header => {
        let actualHeader = header;

        if (_.startsWith(header, IS_HEADER_PREFIX)) {
          actualHeader = header.replace(IS_HEADER_PREFIX, '');

          const data = getInformationAboutNonConcept(actualHeader, header) ||
            getInformationAboutWrongConcept(actualHeader, header);

          if (data) {
            const suggestions =
              entitySetIds
                .map(concept => {
                  const levenshtein = new Levenshtein(concept, actualHeader);

                  return {
                    concept,
                    distance: levenshtein.distance
                  };
                })
                .filter(suggest => suggest.distance < SUGGEST_TOLERANCE)
                .map(suggest => suggest.concept);
            const issue = new Issue(registry.WRONG_ENTITY_IS_HEADER)
              .setPath(fileDescriptor.fullPath)
              .setData(data)
              .setSuggestions(suggestions);

            result.push(issue);
          }
        }
      });
    });

    return result;
  }
};
