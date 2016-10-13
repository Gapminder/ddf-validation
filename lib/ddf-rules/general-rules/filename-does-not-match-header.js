'use strict';

const _ = require('lodash');
const registry = require('../registry');
const constants = require('../../ddf-definitions/constants');
const Issue = require('../issue');

const headerValidator = {
  [constants.CONCEPT]: () => null,
  [constants.ENTITY]: (ddfDataSet, fileDescriptor) =>
    getWrongHeaderIssueForEntity(ddfDataSet, fileDescriptor),
  [constants.DATA_POINT]: (ddfDataSet, fileDescriptor) =>
    getWrongHeaderIssueForDataPoint(fileDescriptor)
};

function getWrongHeaderIssueForDataPoint(fileDescriptor) {
  function includeHeader(conceptFromFileName) {
    return _.includes(fileDescriptor.headers, conceptFromFileName);
  }

  function includeHeaderIs(conceptFromFileName) {
    return _.includes(fileDescriptor.headers, `is--${conceptFromFileName}`);
  }

  const conceptsStringFromFileName =
    fileDescriptor.file
      .replace(/^ddf\-\-datapoints\-\-/, '')
      .replace(/\.csv$/, '')
      .replace('--by--', '--');
  const conceptsFromFileName = conceptsStringFromFileName.split('--');
  const wrongHeaders = conceptsFromFileName.filter(
    conceptFromFileName => !includeHeader(conceptFromFileName) && !includeHeaderIs(conceptFromFileName)
  );

  if (!_.isEmpty(wrongHeaders)) {
    return new Issue(registry.FILENAME_DOES_NOT_MATCH_HEADER)
      .setPath(fileDescriptor.fullPath)
      .setData(wrongHeaders);
  }

  return null;
}

function getWrongHeaderIssueForEntity(ddfDataSet, fileDescriptor) {
  const conceptsStringFromFileName = fileDescriptor.file
    .replace(/^ddf\-\-entities--/, '').replace(/\.csv$/, '');
  const conceptsFromFileName = _.split(conceptsStringFromFileName, '--');
  const entityDomain = _.head(conceptsFromFileName);
  const entitySet = _.last(conceptsFromFileName);

  function getStructuralIssueInfo() {
    function getWrongFileIssueInfo() {
      if (!entityDomain && !entitySet) {
        return {reason: 'Entity set and Entity domain are not found in file name'};
      }

      if (!entityDomain) {
        return {reason: 'Entity domain is not found in file name'};
      }

      return null;
    }

    function getWrongHeaderIssueInfo() {
      function areHeadersWrong() {
        return !_.includes(fileDescriptor.headers, entityDomain) && !_.includes(fileDescriptor.headers, entitySet);
      }

      if (entityDomain && entitySet && areHeadersWrong()) {
        return {
          reason: 'Headers does not corresponds with file name',
          headers: fileDescriptor.headers
        };
      }

      if (!entitySet && !_.includes(fileDescriptor.headers, entityDomain)) {
        return {
          reason: 'File header does not contain Entity domain from file name',
          entityDomain,
          headers: fileDescriptor.headers
        };
      }

      return null;
    }

    return getWrongFileIssueInfo() || getWrongHeaderIssueInfo();
  }

  function getDataBasedIssueInfo() {
    const query = {};
    const conditionalHeader = `is--${entitySet}`;

    query[conditionalHeader] = {$and: [{$ne: '1'}, {$ne: 'TRUE'}]};

    const wrongEntityData = ddfDataSet.getEntity().getDataBy(query);

    if (!_.isEmpty(wrongEntityData)) {
      return {
        reason: 'Wrong Entity data for "is--" based column (non "1")',
        conditionalHeader
      };
    }

    return null;
  }

  const issueInfo = getStructuralIssueInfo() || getDataBasedIssueInfo();

  if (!_.isEmpty(issueInfo)) {
    return new Issue(registry.FILENAME_DOES_NOT_MATCH_HEADER)
      .setPath(fileDescriptor.fullPath)
      .setData(issueInfo);
  }

  return null;
}

function getNonIndexFileDescriptors(ddfDataSet) {
  const nonIndexDirectoryDescriptors = ddfDataSet.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => directoryDescriptor.isDDF && !directoryDescriptor.ddfIndex.exists);

  return _.reduce(
    nonIndexDirectoryDescriptors,
    (aggregation, directoryDescriptor) => aggregation.concat(directoryDescriptor.fileDescriptors),
    []
  );
}

module.exports = {
  rule: ddfDataSet => _.compact(
    getNonIndexFileDescriptors(ddfDataSet)
      .filter(fileDescriptor => fileDescriptor.headers && fileDescriptor.type)
      .map(fileDescriptor => headerValidator[fileDescriptor.type](ddfDataSet, fileDescriptor))
  )
};
