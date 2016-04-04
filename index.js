#! /usr/bin/env node
'use strict';

const path = require('path');
const async = require('async');
const _ = require('lodash');
const utils = require('./lib/utils');
const fileUtils = require('./lib/utils/file');
const DdfIndexGenerator = require('./lib/ddf-definitions/ddf-index-generator');
const DdfData = require('./lib/ddf-definitions/ddf-data');
const ddfRules = require('./lib/ddf-rules');
const ddfDataPointRules = require('./lib/ddf-rules/data-point-rules');
const logger = utils.logger;

if (utils.settings.isIndexGenerationMode === true) {
  const ddfIndexGenerator = new DdfIndexGenerator(utils.ddfRootFolder);

  /*eslint no-console: [2, { allow: ["log"] }] */
  ddfIndexGenerator.getCsv((err, csvContent) => {
    if (err) {
      console.log(err);
      return;
    }

    const file = path.resolve(utils.ddfRootFolder, 'ddf--index.csv');

    fileUtils.writeFile(file, csvContent, fileErr => {
      if (fileErr) {
        console.log(fileErr);
        return;
      }

      console.log(`${file} was created.`);
    });
  });
}

if (utils.settings.isIndexGenerationMode === false) {
  const ddfData = new DdfData(utils.ddfRootFolder);

  let out = [];

  ddfData.load(() => {
    ddfRules.forEach(ruleSet => {
      Object.getOwnPropertySymbols(ruleSet).forEach(key => {
        const result = ruleSet[key](ddfData);

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
        ddfData.getDataPoint().loadDetail(detail, () => {
          Object.getOwnPropertySymbols(ddfDataPointRules).forEach(key => {
            const result = ddfDataPointRules[key](ddfData, detail);

            if (!_.isEmpty(result)) {
              out = out.concat(result);
            }
          });

          ddfData.getDataPoint().removeAllData();
          cb();
        });
      };
    }

    const dataPointActions = [];

    ddfData.getDataPoint().details.forEach(detail => {
      dataPointActions.push(prepareDataPointProcessor(detail));
    });

    async.waterfall(dataPointActions, err => {
      if (err) {
        throw err;
      }

      logger.notice(JSON.stringify(out));

      ddfData.dismiss();
    });
  });
}
