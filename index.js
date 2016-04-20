#! /usr/bin/env node
'use strict';

const async = require('async');
const _ = require('lodash');
const utils = require('./lib/utils');
const DdfIndexGenerator = require('./lib/ddf-definitions/ddf-index-generator');
const DdfDataSet = require('./lib/ddf-definitions/ddf-data-set');
const ddfRules = require('./lib/ddf-rules');
const ddfDataPointRules = require('./lib/ddf-rules/data-point-rules');
const logger = utils.logger;

if (utils.settings.isIndexGenerationMode === true) {
  new DdfIndexGenerator(utils.ddfRootFolder).writeIndex();
}

if (utils.settings.isIndexGenerationMode === false) {
  const ddfDataSet = new DdfDataSet(utils.ddfRootFolder);

  let out = [];

  ddfDataSet.load(() => {
    ddfRules.forEach(ruleSet => {
      Object.getOwnPropertySymbols(ruleSet).forEach(key => {
        const result = ruleSet[key](ddfDataSet);

        if (!_.isArray(result) && !_.isEmpty(result)) {
          out.push(result.view());
        }

        if (_.isArray(result) && !_.isEmpty(result)) {
          result.forEach(resultRecord => {
            out.push(resultRecord.view());
          });
        }
      });
    });

    function prepareDataPointProcessor(detail) {
      return cb => {
        ddfDataSet.getDataPoint().loadDetail(detail, () => {
          Object.getOwnPropertySymbols(ddfDataPointRules).forEach(key => {
            const result = ddfDataPointRules[key](ddfDataSet, detail);

            if (!_.isEmpty(result)) {
              out = out.concat(result.map(issue => issue.view()));
            }
          });

          ddfDataSet.getDataPoint().removeAllData();
          cb();
        });
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
}
