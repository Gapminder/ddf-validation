#! /usr/bin/env node
'use strict';

const path = require('path');
const lodash = require('lodash');
const utils = require('./lib/utils');
const fileUtils = require('./lib/utils/file');
const DdfIndexGenerator = require('./lib/ddf-definitions/ddf-index-generator');
const DdfData = require('./lib/ddf-definitions/ddf-data');
const ddfRules = require('./lib/ddf-rules');
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
  const out = [];

  ddfData.load(() => {
    ddfRules.forEach(ruleSet => {
      Object.getOwnPropertySymbols(ruleSet).forEach(key => {
        const result = ruleSet[key](ddfData);

        if (!lodash.isArray(result) && !lodash.isEmpty(result)) {
          out.push(result.view());
        }

        if (lodash.isArray(result) && !lodash.isEmpty(result)) {
          result.forEach(resultRecord => {
            out.push(resultRecord.view());
          });
        }
      });
    });

    logger.notice(JSON.stringify(out));

    ddfData.dismiss();
  });
}
