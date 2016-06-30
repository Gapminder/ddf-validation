'use strict';

const _ = require('lodash');
const registry = require('./registry');
const constants = require('../ddf-definitions/constants');
const Issue = require('./issue');

const NOT_ALPHANUMERIC = /[^a-z0-9_]/;

function getNonDdfDirectoryDescriptors(ddfData) {
  return ddfData.ddfRoot.directoryDescriptors
    .filter(directoryDescriptor => !directoryDescriptor.isDDF);
}

function isValidJSON(json) {
  let result = true;

  try {
    JSON.parse(json);
  } catch (ex) {
    result = false;
  }

  return result;
}

function correctBoolean(json) {
  return json.replace(/true|false/ig, booleanValue => booleanValue.toLowerCase());
}

function ensureJsonIsSafe(json) {
  return json.replace(/\)[;\n]/g, '');
}

function correctJSON(wrongJSON) {
  let result = null;

  /*eslint-disable no-new-func */

  try {
    const convertFun = new Function(`return JSON.stringify(${ensureJsonIsSafe(correctBoolean(wrongJSON))})`);

    result = convertFun();
  } catch (ex) {
    result = null;
  }

  /*eslint-enable no-new-func */

  return result;
}

function charCount(string, chars) {
  return chars.reduce((res, ch) => {
    res[ch] = string.split(ch).length - 1;
    return res;
  }, {});
}

function isJsonLike(str) {
  if (_.isEmpty(str)) {
    return false;
  }

  const charCounts = charCount(str, ['[', ']', '{', '}']);

  function squareBrackets() {
    return charCounts['['] > 0 && charCounts['['] === charCounts[']'];
  }

  function braces() {
    return charCounts['{'] > 0 && charCounts['{'] === charCounts['}'];
  }

  return squareBrackets() || braces();
}

function detectColumnsHavingJson(ddfDataSet) {
  const conceptDataByFiles = ddfDataSet.getConcept().getDataByFiles();
  const entityDataByFiles = ddfDataSet.getEntity().getDataByFiles();
  const dataByFiles = _.extend(conceptDataByFiles, entityDataByFiles);
  const serviceFields = ['$$source', '$$lineNumber', 'meta', '$loki'];
  const result = {};

  Object.keys(dataByFiles).forEach(fileName => {
    const columnNames = Object.keys(_.head(dataByFiles[fileName]))
      .filter(key => !_.includes(serviceFields, key));
    const jsonColumns = [];

    columnNames.forEach(column => {
      let isNotLikeJson = false;

      dataByFiles[fileName].forEach(record => {
        if (!isJsonLike(record[column]) && record[column]) {
          isNotLikeJson = true;
        }
      });

      if (!isNotLikeJson) {
        jsonColumns.push(column);
      }
    });

    result[fileName] = jsonColumns;
  });

  return result;
}

function isCorrectionPossible(record, column, fileName) {
  return record[column] && record.$$source === fileName && !isValidJSON(record[column]);
}

function getIncorrectJsonIssues(ddfDataSet, ddfDataWrapper) {
  const result = [];
  const columnsHavingJson = detectColumnsHavingJson(ddfDataSet);

  ddfDataWrapper.getAllData().forEach(conceptRecord => {
    Object.keys(columnsHavingJson).forEach(fileName => {
      columnsHavingJson[fileName].forEach(jsonColumn => {
        if (isCorrectionPossible(conceptRecord, jsonColumn, fileName)) {
          const data = {
            column: jsonColumn,
            line: conceptRecord.$$lineNumber + 1,
            value: conceptRecord[jsonColumn]
          };
          const correctedJSON = correctJSON(conceptRecord[jsonColumn]);
          const issue = new Issue(registry.INCORRECT_JSON_FIELD)
            .setPath(conceptRecord.$$source)
            .setData(data);

          if (correctedJSON) {
            issue.setSuggestions([correctedJSON]);
          }

          result.push(issue);
        }
      });
    });
  });

  return result;
}

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

const headerValidator = {
  [constants.CONCEPT]: () => null,
  [constants.ENTITY]: (ddfDataSet, fileDescriptor) =>
    getWrongHeaderIssueForEntity(ddfDataSet, fileDescriptor),
  [constants.DATA_POINT]: (ddfDataSet, fileDescriptor) =>
    getWrongHeaderIssueForDataPoint(fileDescriptor)
};

function getIdentifierColumnsNames(ddfDataSet, firstRecord) {
  const concept = ddfDataSet.getConcept();
  const relatedConceptNames = concept.getDataIdsByType('entity_set')
    .concat(concept.getDataIdsByType('entity_domain'));

  return _.keys(firstRecord)
    .filter(entityHeader => _.includes(relatedConceptNames, entityHeader));
}

function getIncorrectConceptIdentifierIssues(ddfDataSet) {
  return ddfDataSet.getConcept()
    .getAllData()
    .filter(conceptRecord => conceptRecord.concept)
    .filter(conceptRecord => NOT_ALPHANUMERIC.test(conceptRecord.concept))
    .map(conceptRecord =>
      new Issue(registry.INCORRECT_IDENTIFIER)
        .setPath(conceptRecord.$$source)
        .setData([{
          conceptValue: conceptRecord.concept,
          line: conceptRecord.$$lineNumber
        }]));
}

function getIncorrectEntityIdentifierIssues(ddfDataSet) {
  const entitiesByFile = ddfDataSet.getEntity().getDataByFiles();

  function getIssueData(entityFileName, entitiesConcepts) {
    return entitiesByFile[entityFileName]
      .map(entityRecord => entitiesConcepts
        .filter(entityConcept => !!entityRecord[entityConcept])
        .filter(entityConcept => NOT_ALPHANUMERIC.test(entityRecord[entityConcept]))
        .map(entityConcept => ({
          conceptName: entityConcept,
          conceptValue: entityRecord[entityConcept],
          line: entityRecord.$$lineNumber
        })));
  }

  function getIssueByEntityFile(entityFileName) {
    const entitiesConcepts = getIdentifierColumnsNames(ddfDataSet, _.head(entitiesByFile[entityFileName]));
    const issueData = _.compact(_.flattenDeep(getIssueData(entityFileName, entitiesConcepts)));

    if (!_.isEmpty(issueData)) {
      return new Issue(registry.INCORRECT_IDENTIFIER)
        .setPath(entityFileName)
        .setData(issueData);
    }

    return null;
  }

  const issues = _.keys(entitiesByFile)
    .map(entityFileName => getIssueByEntityFile(entityFileName));

  return _.compact(issues);
}

module.exports = {
  [registry.NON_DDF_DATA_SET]: ddfDataSet => {
    const result = [];
    const nonDdfDirectoryDescriptors = getNonDdfDirectoryDescriptors(ddfDataSet);

    if (nonDdfDirectoryDescriptors.length === ddfDataSet.ddfRoot.directoryDescriptors.length) {
      const issue = new Issue(registry.NON_DDF_DATA_SET)
        .setPath(ddfDataSet.ddfRoot.path);

      result.push(issue);
    }

    return result;
  },
  [registry.NON_DDF_FOLDER]: ddfDataSet => getNonDdfDirectoryDescriptors(ddfDataSet)
    .map(directoryDescriptor => new Issue(registry.NON_DDF_FOLDER)
      .setPath(directoryDescriptor.dir)),
  [registry.INCORRECT_JSON_FIELD]: ddfDataSet =>
    getIncorrectJsonIssues(ddfDataSet, ddfDataSet.getConcept())
      .concat(getIncorrectJsonIssues(ddfDataSet, ddfDataSet.getEntity())),
  [registry.FILENAME_DOES_NOT_MATCH_HEADER]: ddfDataSet => ddfDataSet.nonIndexFileDescriptors
    .filter(fileDescriptor => fileDescriptor.headers && fileDescriptor.type)
    .map(fileDescriptor => headerValidator[fileDescriptor.type](ddfDataSet, fileDescriptor))
    .filter(issue => issue),
  [registry.INCORRECT_IDENTIFIER]: ddfDataSet => _.concat(
    getIncorrectEntityIdentifierIssues(ddfDataSet),
    getIncorrectConceptIdentifierIssues(ddfDataSet))
};
