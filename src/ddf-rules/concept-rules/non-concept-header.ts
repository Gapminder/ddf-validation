import { includes, uniq } from 'lodash';
import { NON_CONCEPT_HEADER } from '../registry';
import { DdfDataSet } from '../../ddf-definitions/ddf-data-set';
import { Issue } from '../issue';
import { looksLikeIsField } from '../../utils/ddf-things';
import { CONCEPT_ID, CONCEPT_TYPE } from '../../ddf-definitions/constants';

const Levenshtein = require('levenshtein');
const SUGGEST_TOLERANCE = 3;

function getConceptHeaderDetails(ddfDataSet) {
  const result = [];

  ddfDataSet.getConcept().fileDescriptors.forEach(fileDescriptor =>
    (fileDescriptor.headers || [])
      .filter(header => header !== CONCEPT_ID && header !== CONCEPT_TYPE)
      .forEach(header => result.push({header, fileDescriptor})));

  return result;
}

function getDataPointHeaderDetails(ddfDataSet) {
  const result = [];

  ddfDataSet.getDataPoint().fileDescriptors.forEach(fileDescriptor =>
    fileDescriptor.headers.forEach(header => result.push({header, fileDescriptor})));

  return result;
}

function getEntityHeaderDetails(ddfDataSet) {
  const result = [];

  ddfDataSet.getEntity().fileDescriptors.forEach(fileDescriptor => {
    fileDescriptor.headers.forEach(header => {
      if (!looksLikeIsField(header)) {
        result.push({header, fileDescriptor});
      }
    });
  });

  return result;
}

function getHeaderDetailObjects(ddfDataSet) {
  return getDataPointHeaderDetails(ddfDataSet)
    .concat(getEntityHeaderDetails(ddfDataSet))
    .concat(getConceptHeaderDetails(ddfDataSet));
}

function isNativeConcept(conceptName) {
  return conceptName === CONCEPT_ID || conceptName === CONCEPT_TYPE;
}

function setNonConceptHeaderIssue(conceptIds, detailObject, result) {
  const header = detailObject.header.replace(/^"/, '').replace(/"$/, '').replace(/^is--/, '');

  if (!includes(conceptIds, header) && !isNativeConcept(header)) {
    const suggestions = uniq(
      conceptIds
        .map(concept => {
          const levenshtein = new Levenshtein(concept, header);

          return {
            concept,
            distance: levenshtein.distance
          };
        })
        .filter(suggest => suggest.distance < SUGGEST_TOLERANCE)
        .map(suggest => suggest.concept)
    );

    const issue = new Issue(NON_CONCEPT_HEADER)
      .setPath(detailObject.fileDescriptor.fullPath)
      .setData(header)
      .setSuggestions(suggestions);

    result.push(issue);
  }
}

export const rule = {
  rule: (ddfDataSet: DdfDataSet) => {
    const result = [];
    const conceptIds = ddfDataSet.getConcept().getIds();

    getHeaderDetailObjects(ddfDataSet)
      .map(headerDetailObject =>
        setNonConceptHeaderIssue(conceptIds, headerDetailObject, result));

    return result;
  }
};
