import * as fs from 'fs';
import * as path from 'path';
import { isString } from 'lodash';
import { logger, settings, ddfRootFolder } from './utils';
import { getRulesInformation } from './ddf-rules/registry';
import { DataPackage } from './data/data-package';
import { DdfJsonCorrector } from './ddf-definitions/ddf-json-corrector';
import { StreamValidator, validate } from './index';
import { checkLatestVersion } from './version';

const localPackage = require('./package.json');

let isValidationExpected: boolean = true;

if (settings.versionShouldBePrinted) {
  console.log(localPackage.version);

  isValidationExpected = false;
}

if (settings.isDataPackageGenerationMode) {
  const ddfPath = path.resolve(ddfRootFolder || '.');
  const dataPackagePath = path.resolve(ddfPath, 'datapackage.json');
  const isDataPackageExists = fs.existsSync(dataPackagePath);

  let dataPackageContent = null;

  if (isDataPackageExists) {
    try {
      dataPackageContent = JSON.parse(fs.readFileSync(dataPackagePath, 'utf-8'));
    } catch (err) {
      logger.notice(`datapackage.json error: ${err}.`);
      process.exit(1);
    }
  }

  const dataPackage = new DataPackage(ddfPath, settings);

  console.log('datapackage creation started...');

  dataPackage.build(() => {

    console.log('resources are ready');

    dataPackage.write(settings, dataPackageContent, (err: any, filePath: string) => {
      if (err) {
        logger.notice(`datapackage.json was NOT created: ${err}.`);
        return;
      }

      logger.notice(`${filePath} was created successfully.`);
    });
  });

  isValidationExpected = false;
}

if (settings.isJsonAutoCorrectionMode) {
  const ddfJsonCorrector = new DdfJsonCorrector(ddfRootFolder);

  ddfJsonCorrector.correct((correctorError: any, csvFileDescriptors: any) => {
    if (correctorError) {
      logger.notice(correctorError);
      return;
    }

    ddfJsonCorrector.write(csvFileDescriptors, (writeError: any) => {
      logger.notice(writeError ? writeError : 'ok...');
    });
  });

  isValidationExpected = false;
}

if (settings.isPrintRules) {
  logger.notice(getRulesInformation());
  isValidationExpected = false;
}

if (!isValidationExpected) {
  checkLatestVersion(localPackage.version);
}

if (isValidationExpected) {
  const validator = new StreamValidator(ddfRootFolder, settings);

  logger.notice('[');

  validator.on('issue', (issue: any) => {
    if (isString(issue)) {
      logger.notice(issue + '\n');
    }

    if (!isString(issue)) {
      logger.notice(`${JSON.stringify(issue, null, 2)},\n`);
    }
  });

  validator.on('finish', (err: any) => {
    if (err) {
      throw err;
    }

    logger.notice('{}]\n');

    checkLatestVersion(localPackage.version);
  });

  validate(validator);
}
