'use strict';

const _ = require('lodash');
const registry = require('./registry');
const Issue = require('./issue');

const CONCEPT_TERMS = ['concept', 'concept_type'];

function getWrongIndexKeyOrValueIssues(kind, rule) {
  return (ddfDataSet, ddfIndex) => {
    function getUndefinedConcept(concept) {
      const foundConcept = ddfDataSet.getConcept().getRecordByKey(concept);

      return !!foundConcept || _.includes(CONCEPT_TERMS, concept) ? null : concept;
    }

    const wrongKeys = _.compact(_.flatten(
      ddfIndex.content.map(indexRecord => {
        const keys = indexRecord[kind].split(',');

        return _.compact(keys.map(key => getUndefinedConcept(key)));
      })
    ));

    if (_.isEmpty(wrongKeys)) {
      return null;
    }

    return new Issue(rule)
      .setPath(ddfIndex.ddfPath)
      .setData(wrongKeys);
  };
}

const getWrongIndexKeyIssues = getWrongIndexKeyOrValueIssues('key', registry.WRONG_INDEX_KEY);
const getWrongIndexValueIssues = getWrongIndexKeyOrValueIssues('value', registry.WRONG_INDEX_VALUE);

module.exports = {
  [registry.INCORRECT_FILE]: ddfDataSet => _.flattenDeep(
    ddfDataSet.ddfRoot.directoryDescriptors
      .filter(directoryDescriptor => directoryDescriptor.isDDF)
      .map(
        directoryDescriptor => (directoryDescriptor.ddfIndex.issues || [])
          .filter(issue => issue && issue.type === registry.INCORRECT_FILE)
          .map(issue => new Issue(issue.type).setPath(issue.path).setData(issue.data))
      )
  ),
  [registry.INDEX_IS_NOT_FOUND]: ddfDataSet => ddfDataSet.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => directoryDescriptor.isDDF && !!directoryDescriptor.ddfIndex.error)
    .map(directoryDescriptor => new Issue(registry.INDEX_IS_NOT_FOUND)
      .setPath(directoryDescriptor.dir)),
  [registry.WRONG_INDEX_KEY]: ddfDataSet => ddfDataSet.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => directoryDescriptor.isDDF)
    .map(directoryDescriptor =>
      getWrongIndexKeyIssues(ddfDataSet, directoryDescriptor.ddfIndex))
    .filter(issue => !!issue),
  [registry.WRONG_INDEX_VALUE]: ddfDataSet => ddfDataSet.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => directoryDescriptor.isDDF)
    .map(directoryDescriptor =>
      getWrongIndexValueIssues(ddfDataSet, directoryDescriptor.ddfIndex))
    .filter(issue => !!issue)
};
