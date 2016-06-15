#! /usr/bin/env node
'use strict';

const async = require('async');
const _ = require('lodash');
const utils = require('./lib/utils');
const DdfIndexGenerator = require('./lib/ddf-definitions/ddf-index-generator');
const DdfJsonCorrector = require('./lib/ddf-definitions/ddf-json-corrector');
const DdfDataSet = require('./lib/ddf-definitions/ddf-data-set');
const ddfRules = require('./lib/ddf-rules');
const ddfDataPointRules = require('./lib/ddf-rules/data-point-rules');
const rulesRegistry = require('./lib/ddf-rules/registry');
const IssuesFilter = require('./lib/utils/issues-filter');
const logger = utils.logger;

if (utils.settings.isIndexGenerationMode) {
  new DdfIndexGenerator(utils.ddfRootFolder).writeIndex();
  return;
}

if (utils.settings.isJsonAutoCorrectionMode) {
  const ddfJsonCorrector = new DdfJsonCorrector(utils.ddfRootFolder);

  ddfJsonCorrector.correct((correctorError, csvFileDescriptors) => {
    if (correctorError) {
      logger.notice(correctorError);
      return;
    }

    ddfJsonCorrector.write(csvFileDescriptors, writeError => {
      logger.notice(writeError ? writeError : 'ok...');
    });
  });

  return;
}

if (utils.settings.isPrintRules) {
  logger.notice(rulesRegistry.getRulesInformation());
  return;
}

const issuesFilter = new IssuesFilter(utils.settings);
const ddfDataSet = new DdfDataSet(utils.ddfRootFolder);

let out = [];

ddfDataSet.load(() => {
  ddfRules.forEach(ruleSet => {
    Object.getOwnPropertySymbols(ruleSet)
      .filter(key => issuesFilter.isAllowed(key))
      .map(key => ruleSet[key](ddfDataSet))
      .filter(issues => !_.isEmpty(issues))
      .forEach(issue => {
        if (!_.isArray(issue)) {
          out.push(issue.view());
        }

        if (_.isArray(issue)) {
          issue.forEach(resultRecord => {
            out.push(resultRecord.view());
          });
        }
      });
  });

  function prepareDataPointProcessor(dataPointDetail) {
    return cb => {
      ddfDataSet.getDataPoint().loadDetail(
        dataPointDetail,
        (dataPointRecord, line) => {
          Object.getOwnPropertySymbols(ddfDataPointRules)
            .filter(key => issuesFilter.isAllowed(key))
            .forEach(key => {
              const result = ddfDataPointRules[key]({ddfDataSet, dataPointDetail, dataPointRecord, line});

              if (!_.isEmpty(result)) {
                out = out.concat(result.map(issue => issue.view()));
              }
            });
        },
        err => cb(err)
      );
    };
  }

  const dataPointActions = [];

  ddfDataSet.getDataPoint().details.forEach(detail => {
    dataPointActions.push(prepareDataPointProcessor(detail));
  });

  async.waterfall(dataPointActions, err => {
    if (err) {
      throw err;
    }

    logger.notice(JSON.stringify(out));

    ddfDataSet.dismiss();
  });
});
