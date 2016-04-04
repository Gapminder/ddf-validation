'use strict';

const _ = require('lodash');
const Levenshtein = require('levenshtein');
const registry = require('./registry');
const Issue = require('./issue');
const SUGGEST_TOLERANCE = 5;

module.exports = {
  [registry.ENTITY_HEADER_IS_NOT_CONCEPT]: ddfData => {
    const result = [];
    const conceptIds = ddfData.getConcept().getIds();

    ddfData.getEntity().details.forEach(detail => {
      detail.header.forEach(recordParam => {
        let record = recordParam;

        if (_.includes(recordParam, 'is--')) {
          record = recordParam.replace(/^is--/, '');
        }

        if (conceptIds.indexOf(record) < 0) {
          const suggestions = _.uniq(
            conceptIds
              .map(concept => {
                const levenshtein = new Levenshtein(concept, record);

                return {
                  concept,
                  distance: levenshtein.distance
                };
              })
              .filter(suggest => suggest.distance < SUGGEST_TOLERANCE)
              .map(suggest => suggest.concept)
          );

          const issue = new Issue(registry.ENTITY_HEADER_IS_NOT_CONCEPT, detail.fileDescriptor.fullPath, recordParam);

          if (suggestions) {
            issue.suggestions = suggestions;
          }

          result.push(issue);
        }
      });
    });

    return result;
  }
};