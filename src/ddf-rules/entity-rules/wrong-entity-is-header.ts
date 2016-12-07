import {includes, startsWith} from 'lodash';
import {WRONG_ENTITY_IS_HEADER} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';
import * as Levenshtein from 'levenshtein';

const SUGGEST_TOLERANCE = 5;
const IS_HEADER_PREFIX = 'is--';

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const result = [];
    const conceptIds = ddfDataSet.getConcept().getIds();
    const entitySetIds = ddfDataSet.getConcept().getDataIdsByType('entity_set');

    function getInformationAboutNonConcept(actualHeaderDetail, headerDetail) {
      return includes(conceptIds, actualHeaderDetail) ? null : {
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

        if (startsWith(header, IS_HEADER_PREFIX)) {
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
            const issue = new Issue(WRONG_ENTITY_IS_HEADER)
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
