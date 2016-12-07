import {extend, head, includes, compact, flattenDeep} from 'lodash';
import {INCORRECT_JSON_FIELD} from '../registry';
import {DdfDataSet} from '../../ddf-definitions/ddf-data-set';
import {Issue} from '../issue';

function isJsonLike(value) {
  return /^\[.*\]$|^{.*}$/g.test(value);
}

function detectColumnsHavingJson(ddfDataWrapper) {
  const dataByFiles = extend({}, ddfDataWrapper.getDataByFiles());
  const serviceFields = ['$$source', '$$lineNumber'];
  const result = {};

  Object.keys(dataByFiles).forEach(fileName => {
    const columnNames = Object.keys(head(dataByFiles[fileName])).filter(key => !includes(serviceFields, key));
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

function isValidJSON(json) {
  let result = true;

  try {
    JSON.parse(json);
  } catch (ex) {
    result = false;
  }

  return result;
}


function isCorrectionPossible(record, column, fileName) {
  return record[column] && record.$$source === fileName && !isValidJSON(record[column]);
}

function getIncorrectJsonIssues(ddfDataWrapper) {
  const columnsHavingJson = detectColumnsHavingJson(ddfDataWrapper);

  const issues = Object.keys(columnsHavingJson).map(fileName => {
    return columnsHavingJson[fileName].map(jsonColumn => {
      return ddfDataWrapper.getAllData()
        .filter(record => isCorrectionPossible(record, jsonColumn, fileName))
        .map(record => {
          const data = {
            column: jsonColumn,
            line: record.$$lineNumber + 1,
            value: record[jsonColumn]
          };
          const correctedJSON = correctJSON(record[jsonColumn]);
          const issue = new Issue(INCORRECT_JSON_FIELD)
            .setPath(record.$$source)
            .setData(data);

          if (correctedJSON) {
            issue.setSuggestions([correctedJSON]);
          }

          return issue;
        });
    });
  });

  return compact(flattenDeep(issues));
}

export const rule = {
  rule: (ddfDataSet: DdfDataSet) =>
    getIncorrectJsonIssues(ddfDataSet.getConcept()).concat(getIncorrectJsonIssues(ddfDataSet.getEntity()))
};
