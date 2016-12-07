import * as path from 'path';
import {logger, settings, ddfRootFolder} from './utils';
import {getRulesInformation} from './ddf-rules/registry';
import {DataPackage} from './data/data-package';
import {DdfJsonCorrector} from './ddf-definitions/ddf-json-corrector';
import {StreamValidator, validate} from './index';

if (settings.isDataPackageGenerationMode) {
  const dataPackage = new DataPackage(path.resolve(ddfRootFolder || '.'));

  dataPackage.build(() => {
    dataPackage.write((err: any, filePath: string) => {
      if (err) {
        logger.notice(`datapackage.json was NOT created: ${err}.`);
        return;
      }

      logger.notice(`${filePath} was created successfully.`);
    });
  });
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
}

if (settings.isPrintRules) {
  logger.notice(getRulesInformation());
}

const validator = new StreamValidator(ddfRootFolder, settings);

logger.notice('[');

validator.on('issue', (issue: any) => {
  logger.notice(`${JSON.stringify(issue)},\n`);
});

validator.on('finish', (err: any) => {
  if (err) {
    throw err;
  }

  logger.notice('{}]\n');
});

validate(validator);
