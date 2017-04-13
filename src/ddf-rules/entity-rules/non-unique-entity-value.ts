import {
  head,
  startsWith,
  intersection,
  isEqual,
  includes,
} from 'lodash';
import {NON_UNIQUE_ENTITY_VALUE} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

const ddfTimeUtils = require('ddf-time-utils');

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const conceptTypeHash = ddfDataSet.getConcept().getDictionary(null, 'concept_type');
    const domainTypeHash = ddfDataSet.getConcept().getDictionary(null, 'domain');
    const entities = ddfDataSet.getEntity().getDataByFiles();
    const isTimeType = (contentType: string) => includes(ddfTimeUtils.TIME_TYPES_DDF_COMPATIBLE, contentType);

    function getEntitiesFilesDescriptor() {
      const entitiesFilesDescriptor = {};

      Object.keys(entities).forEach(entityFile => {
        const firstRecord = head(entities[entityFile]);

        entitiesFilesDescriptor[entityFile] = {};
        entitiesFilesDescriptor[entityFile].entityIdField = head(
          Object.keys(firstRecord)
            .filter(
              key =>
              conceptTypeHash[key] === 'entity_domain' || conceptTypeHash[key] === 'entity_set' || isTimeType(conceptTypeHash[key])
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
      const relatedKeys1 = Object.keys(record1).filter(key => !startsWith(key, '$'));
      const relatedKeys2 = Object.keys(record2).filter(key => !startsWith(key, '$'));
      const sameKeys = intersection(relatedKeys1, relatedKeys2);

      let result = false;

      for (const key of sameKeys) {
        if (!isEqual(record1[key], record2[key])) {
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
              const isCheckingNotNeeded = includes(processed, record1) && includes(processed, record2);

              if (record1 !== record2 && !isCheckingNotNeeded) {
                if (checkDuplicationIssue(record1, record2)) {
                  const issue = new Issue(NON_UNIQUE_ENTITY_VALUE)
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
