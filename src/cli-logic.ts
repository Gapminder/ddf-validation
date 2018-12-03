import * as v8 from 'v8';
import { logger, settings, ddfRootFolder } from './utils';
import { validationTransport } from './utils/logger';
import { getRulesInformation } from './ddf-rules/registry';
import { DdfJsonCorrector } from './ddf-definitions/ddf-json-corrector';
import { StreamValidator, JSONValidator, validate, createDataPackage, getDataPackageActuality } from './index';
import { checkLatestVersion } from './version';
import { IssueView } from './ddf-rules/issue';

const localPackage = require('./package.json');

let isValidationExpected: boolean = true;

if (settings.versionShouldBePrinted) {
  console.log(localPackage.version);

  isValidationExpected = false;
}

if (settings.heap) {
  v8.setFlagsFromString(`--max-old-space-size=${settings.heap}`);
}

if (settings.isDataPackageActual && !settings.versionShouldBePrinted) {
  isValidationExpected = false;

  getDataPackageActuality({ddfRootFolder}, (message) => {
    console.log(message);

    process.exit(0);
  });
}

if (settings.isDataPackageGenerationMode && !settings.versionShouldBePrinted) {
  createDataPackage({ddfRootFolder}, (message) => {
    console.log(message);
  }, (err) => {
    if (err) {
      console.log(err);

      process.exit(1);
    }
  });

  isValidationExpected = false;
}

if (settings.isJsonAutoCorrectionMode && !settings.versionShouldBePrinted) {
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

if (settings.isPrintRules && !settings.versionShouldBePrinted) {
  logger.notice(getRulesInformation());
  isValidationExpected = false;
}

if (!isValidationExpected) {
  checkLatestVersion(localPackage.version);
}

if (isValidationExpected) {
  const ExpectedValidator = settings.isSummaryNeeded || settings.silent ? JSONValidator : StreamValidator;
  const validator = new ExpectedValidator(ddfRootFolder, settings);
  const issues = [];

  let hasIssue = false;

  validator.on('issue', (issue: IssueView) => {
    hasIssue = true;

    if (validator instanceof StreamValidator) {
      logger.notice(`${JSON.stringify(issue, null, 2)},\n`);
    }

    if (validator instanceof JSONValidator) {
      issues.push(issue);
    }
  });

  validator.on('finish', (err: any) => {
    if (err) {
      throw err;
    }

    if (!settings.silent && !settings.isSummaryNeeded && hasIssue) {
      console.log(`\nValidation was finished with issues. Details are here: ${validationTransport.file}.`);
    }

    if (settings.silent && hasIssue) {
      console.log(JSON.stringify(issues, null, 2));
    }

    if (validator instanceof JSONValidator && settings.isSummaryNeeded && hasIssue) {
      console.log(`\n\nSummary:\n\n${JSON.stringify(validator.summary, null, 2)}`);
    }

    if (!settings.silent && !hasIssue) {
      console.log('\nValidation was finished successfully.');
    }

    checkLatestVersion(localPackage.version, hasIssue ? 1 : 0);
  });

  validate(validator);
}
