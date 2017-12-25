import { includes } from 'lodash';
import * as Levenshtein from 'levenshtein';
import { WRONG_ENTITY_IS_HEADER } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { CONCEPT_TYPE_ENTITY_SET, fieldIsPrefix, looksLikeIsField } from '../../utils/ddf-things';

const SUGGEST_TOLERANCE = 5;

const getInformationAboutNonConcept = (ddfDataSet, actualHeaderDetail, headerDetail) =>
  includes(ddfDataSet.getConcept().getIds(), actualHeaderDetail) ? null : {
    message: 'Not a concept',
    headerDetail
  };

const getInformationAboutWrongNonEntityConcept = (ddfDataSet, actualHeaderDetail, headerDetail) => {
  const conceptRecord = ddfDataSet.getConcept().getRecordByKey(actualHeaderDetail);

  return !conceptRecord || conceptRecord.concept_type !== CONCEPT_TYPE_ENTITY_SET ? {
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
  return ddfDataSet.getConcept().getDataIdsByType(CONCEPT_TYPE_ENTITY_SET)
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

        if (looksLikeIsField(header)) {
          actualHeader = header.replace(fieldIsPrefix, '');

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
