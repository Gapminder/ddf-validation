'use strict';

const _ = require('lodash');
const Levenshtein = require('levenshtein');
const registry = require('./registry');
const Issue = require('./issue');
const constants = require('../ddf-definitions/constants');
const SUGGEST_TOLERANCE = 5;
const IS_HEADER_PREFIX = 'is--';

module.exports = {
  [registry.WRONG_ENTITY_IS_HEADER]: ddfDataSet => {
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

    ddfDataSet.getEntity().details.forEach(detail => {
      detail.header.forEach(headerDetail => {
        let actualHeaderDetail = headerDetail;

        if (_.startsWith(headerDetail, IS_HEADER_PREFIX)) {
          actualHeaderDetail = headerDetail.replace(IS_HEADER_PREFIX, '');

          const data = getInformationAboutNonConcept(actualHeaderDetail, headerDetail) ||
            getInformationAboutWrongConcept(actualHeaderDetail, headerDetail);

          if (data) {
            const suggestions =
              entitySetIds
                .map(concept => {
                  const levenshtein = new Levenshtein(concept, actualHeaderDetail);

                  return {
                    concept,
                    distance: levenshtein.distance
                  };
                })
                .filter(suggest => suggest.distance < SUGGEST_TOLERANCE)
                .map(suggest => suggest.concept);
            const issue = new Issue(registry.WRONG_ENTITY_IS_HEADER)
              .setPath(detail.fileDescriptor.fullPath)
              .setData(data)
              .setSuggestions(suggestions);

            result.push(issue);
          }
        }
      });
    });

    return result;
  },
  [registry.WRONG_ENTITY_IS_VALUE]: ddfDataSet => {
    const result = [];
    const entities = ddfDataSet.getEntity().getDataByFiles();
    const entityFiles = _.keys(entities);
    const VALUE_TEMPLATE = ['true', 'false', '0', '1'];

    entityFiles.forEach(entityFile => {
      if (!_.isEmpty(entities[entityFile])) {
        const expectedKeys = _.keys(_.head(entities[entityFile]))
          .filter(entityRecordKey =>
            _.startsWith(entityRecordKey, IS_HEADER_PREFIX));

        entities[entityFile].forEach(entityRecord => {
          expectedKeys.forEach(key => {
            if (!_.includes(VALUE_TEMPLATE, _.lowerCase(entityRecord[key]))) {
              const data = {
                header: key,
                line: entityRecord.$$lineNumber + constants.LINE_NUM_INCLUDING_HEADER,
                value: entityRecord[key]
              };
              const issue = new Issue(registry.WRONG_ENTITY_IS_VALUE)
                .setPath(entityFile)
                .setData(data);

              result.push(issue);
            }
          });
        });
      }
    });

    return result;
  }
};
