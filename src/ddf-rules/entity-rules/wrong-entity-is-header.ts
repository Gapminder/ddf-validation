import { includes, startsWith } from 'lodash';
import { WRONG_ENTITY_IS_HEADER } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import * as Levenshtein from 'levenshtein';

const SUGGEST_TOLERANCE = 5;
const IS_HEADER_PREFIX = 'is--';

const getInformationAboutNonConcept = (ddfDataSet, actualHeaderDetail, headerDetail) =>
  includes(ddfDataSet.getConcept().getIds(), actualHeaderDetail) ? null : {
    message: 'Not a concept',
    headerDetail
  };

const getInformationAboutWrongNonEntityConcept = (ddfDataSet, actualHeaderDetail, headerDetail) => {
  const conceptRecord = ddfDataSet.getConcept().getRecordByKey(actualHeaderDetail);

  return !conceptRecord || conceptRecord.concept_type !== 'entity_set' ? {
    message: 'Wrong concept type',
    headerDetail
  } : null;
};

const getInformationForbiddenDomain = (ddfDataSet, actualHeader, fileDescriptor) => {
  const domainTypeHash = ddfDataSet.getConcept().getDictionary(null, 'domain');
  const primaryKeyDomain = domainTypeHash[fileDescriptor.primaryKey] || fileDescriptor.primaryKey;
  const currentDomain = domainTypeHash[actualHeader];
  const isCurrentDomainExists = includes(ddfDataSet.getConcept().getAllData().map(record => record.concept), currentDomain);

  if (primaryKeyDomain === domainTypeHash[actualHeader] || !isCurrentDomainExists) {
    return null;
  }

  return {
    message: 'Forbidden domain for the entity set',
    currentEntitySet: actualHeader,
    currentDomain,
    primaryKeyDomain
  };
};

const getSuggestions = (ddfDataSet, actualHeader) => {
  return ddfDataSet.getConcept().getDataIdsByType('entity_set')
    .map(concept => {
      const levenshtein = new Levenshtein(concept, actualHeader);

      return {
        concept,
        distance: levenshtein.distance
      };
    })
    .filter(suggest => suggest.distance < SUGGEST_TOLERANCE)
    .map(suggest => suggest.concept);
};

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const result = [];

    ddfDataSet.getEntity().fileDescriptors.forEach(fileDescriptor => {
      fileDescriptor.headers.forEach(header => {
        let actualHeader = header;

        if (startsWith(header, IS_HEADER_PREFIX)) {
          actualHeader = header.replace(IS_HEADER_PREFIX, '');

          const data = getInformationAboutNonConcept(ddfDataSet, actualHeader, header) ||
            getInformationAboutWrongNonEntityConcept(ddfDataSet, actualHeader, header) ||
            getInformationForbiddenDomain(ddfDataSet, actualHeader, fileDescriptor);

          if (data) {
            const suggestions = getSuggestions(ddfDataSet, actualHeader);
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
