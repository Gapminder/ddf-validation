'use strict';

const _ = require('lodash');
const Levenshtein = require('levenshtein');
const registry = require('./registry');
const Issue = require('./issue');
const constants = require('../ddf-definitions/constants');
const SUGGEST_TOLERANCE = 5;
const IS_HEADER_PREFIX = 'is--';
const LOKI_META_FIELD = 'meta';

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
    const VALUE_TEMPLATE = ['true', 'false', 'TRUE', 'FALSE'];

    entityFiles.forEach(entityFile => {
      if (!_.isEmpty(entities[entityFile])) {
        const expectedKeys = _.keys(_.head(entities[entityFile]))
          .filter(entityRecordKey =>
            _.startsWith(entityRecordKey, IS_HEADER_PREFIX));

        entities[entityFile].forEach(entityRecord => {
          expectedKeys.forEach(key => {
            if (!_.includes(VALUE_TEMPLATE, entityRecord[key])) {
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
  },
  [registry.NON_UNIQUE_ENTITY_VALUE]: ddfDataSet => {
    const conceptTypeHash = ddfDataSet.getConcept().getDictionary(null, 'concept_type');
    const domainTypeHash = ddfDataSet.getConcept().getDictionary(null, 'domain');
    const entities = ddfDataSet.getEntity().getDataByFiles();

    function getEntitiesFilesDescriptor() {
      const entitiesFilesDescriptor = {};

      Object.keys(entities).forEach(entityFile => {
        const firstRecord = _.head(entities[entityFile]);

        entitiesFilesDescriptor[entityFile] = {};
        entitiesFilesDescriptor[entityFile].entityIdField = _.head(
          Object.keys(firstRecord)
            .filter(
              key =>
              conceptTypeHash[key] === 'entity_domain' || conceptTypeHash[key] === 'entity_set'
            )
        );
        entitiesFilesDescriptor[entityFile].entityDomain = entitiesFilesDescriptor[entityFile].entityIdField;

        if (conceptTypeHash[entitiesFilesDescriptor[entityFile].entityIdField] !== 'entity_domain') {
          entitiesFilesDescriptor[entityFile].entityDomain =
            domainTypeHash[entitiesFilesDescriptor[entityFile].entityIdField];
        }
      });

      return entitiesFilesDescriptor;
    }


    function checkDuplicationIssue(record1, record2) {
      const relatedKeys1 = Object.keys(record1).filter(key => !_.startsWith(key, '$') && key !== LOKI_META_FIELD);
      const relatedKeys2 = Object.keys(record2).filter(key => !_.startsWith(key, '$') && key !== LOKI_META_FIELD);
      const sameKeys = _.intersection(relatedKeys1, relatedKeys2);

      let result = false;

      for (const key of sameKeys) {
        if (!_.isEqual(record1[key], record2[key])) {
          result = true;
          break;
        }
      }

      return result;
    }

    function getDuplicatesHash(entitiesFilesDescriptor) {
      const duplicatesHash = {};

      Object.keys(entities).forEach(file => {
        const entityDescriptor = entitiesFilesDescriptor[file];

        entities[file].forEach(entityRecord => {
          if (!duplicatesHash[entityDescriptor.entityDomain]) {
            duplicatesHash[entityDescriptor.entityDomain] = {};
          }

          if (!duplicatesHash[entityDescriptor.entityDomain][entityRecord[entityDescriptor.entityIdField]]) {
            duplicatesHash[entityDescriptor.entityDomain][entityRecord[entityDescriptor.entityIdField]] = [];
          }

          duplicatesHash[entityDescriptor.entityDomain][entityRecord[entityDescriptor.entityIdField]]
            .push(entityRecord);
        });
      });

      return duplicatesHash;
    }

    const duplicatesHash = getDuplicatesHash(getEntitiesFilesDescriptor());
    const issues = [];

    Object.keys(duplicatesHash).forEach(entityDomain => {
      Object.keys(duplicatesHash[entityDomain]).forEach(entityId => {
        if (duplicatesHash[entityDomain][entityId].length > 1) {
          const processed = [];

          duplicatesHash[entityDomain][entityId].forEach(record1 => {
            duplicatesHash[entityDomain][entityId].forEach(record2 => {
              const isCheckingNotNeeded = _.includes(processed, record1) && _.includes(processed, record2);

              if (record1 !== record2 && !isCheckingNotNeeded) {
                if (checkDuplicationIssue(record1, record2)) {
                  const issue = new Issue(registry.NON_UNIQUE_ENTITY_VALUE)
                    .setPath(record1.$$source).setData({source: record1, duplicate: record2});

                  issues.push(issue);
                }

                processed.push(record1, record2);
              }
            });
          });
        }
      });
    });

    return issues;
  }
};
