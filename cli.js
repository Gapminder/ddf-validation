#! /usr/bin/env node
'use strict';

const utils = require('./lib/utils');
const DataPackage = require('./lib/data/data-package');
const DdfJsonCorrector = require('./lib/ddf-definitions/ddf-json-corrector');
const api = require('./index');
const StreamValidator = api.StreamValidator;
const rulesRegistry = require('./lib/ddf-rules/registry');
const logger = utils.logger;

if (utils.settings.isDataPackageGenerationMode) {
  const dataPackage = new DataPackage(utils.ddfRootFolder || '.');

  dataPackage.build(() => {
    dataPackage.write(() => {
      logger.notice(`datapackage.json for ${utils.ddfRootFolder} was created.`);
    });
  });
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

const validator = new StreamValidator(utils.ddfRootFolder, utils.settings);

logger.notice('[');

validator.on('issue', issue => {
  logger.notice(`${JSON.stringify(issue)},\n`);
});

validator.on('finish', err => {
  if (err) {
    throw err;
  }

  logger.notice('{}]\n');
});

api.validate(validator);
