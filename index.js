#! /usr/bin/env node
'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const rx = require('rxjs');
const utils = require('./utils');

const logger = utils.getLogger();
const folder = utils.ddfRootFolder;
const settings = utils.settings;

// validate list of ddf folders and get it as Observable(logger, folder)
const DdfRootFolderValidator = require('./lib/ddf-root-folder.validator.js');
const ddfRootFolderValidator = new DdfRootFolderValidator(logger, folder);

if (!ddfRootFolderValidator.ddfFolders$) {
  return;
}

ddfRootFolderValidator
  .getValidator()
  .subscribe(DdfRootFolderValidator.validate(ddfRootFolderValidator));

function validateMeasureValues(ddfFolders$) {
  // 1.
  // gather measures
  // check is they are present in measures.csv
  // 2.
  // gather dimensions
  // check is they are present in dimensions.csv
  // 3.
  // gather dimension values from measure values
  // gather dimension values from dimensions values files
  // check is all (dv from mv) are present in dimensions values files
  // check is all (dv from dv) are present in measure files
  // 4.
  // check data points consistency
  const measuresSchema = require('./ddf-schema/ddf-measures.schema');
  const measureValuesSchema = require('./ddf-schema/ddf-measure-values.schema');
  const dimensionsSchema = require('./ddf-schema/ddf-dimensions.schema');

  ddfFolders$
    .do(x => logger.notice(`Validating measure values: folder ${x}`))
    .map(folderPath => {
      const filesInFolder$ = require('./utils/rx-read-files-in-folder')(folderPath)
        .map(fileName => path.basename(fileName));
      // filter measure values files
      const measureValuesFiles$ = filesInFolder$
        .filter(fileName => measureValuesSchema.fileExp.test(fileName));

      // measure.csv file stream
      const measureFile$ = require('./ddf-utils/rx-read-measures')(folderPath);
      // dimensions.csv file stream
      const dimensionsFile$ = require('./ddf-utils/rx-read-dimension')(folderPath);

      // read measure IDs from measure.csv
      const measures$ = measureFile$
        .first()
        .mergeMapTo(measureFile$, _.zipObject)
        .pluck(measuresSchema.gid)
        .toArray();

      // read dimension IDs from dimensions.csv
      const dimensions$ = dimensionsFile$
        .first()
        .mergeMapTo(measureFile$, _.zipObject)
        .pluck(measuresSchema.gid)
        .toArray();

      // read measure IDs from dimension values fileNames
      const measuresFromDvFiles$ = measureValuesFiles$
        .map(fileName => measureValuesSchema.measure(fileName))
        // todo: replace toArray.map with .distinct when implemented in rxjs
        //.distinct() // todo: do nor remove this line
        .toArray().map(x => require('lodash').uniq(x));

      // read dimension IDs from measure values fileNames
      const dimensionsFromMvFiles$ = measureValuesFiles$
        .map(fileName => measureValuesSchema.dimensions(fileName))
        // todo: replace toArray.map with .distinct when implemented in rxjs
        //.distinct() // todo: do nor remove this line
        .toArray().mergeMap(x => require('lodash').uniq(x));

      // compare and validate measure IDs
      measures$.combineLatest(measuresFromDvFiles$, (measuresFromCsv, measuresFromFiles) => {
        // check missing measure in measures.csv
        const diff1 = _.difference(measuresFromFiles, measuresFromCsv);
        if (diff1.length) {
          logger.error(`Error! Please add measures to ${measuresSchema.fileName} ${diff1}`);
        }
        // check missing measure values in folder
        const diff2 = _.difference(measuresFromCsv, measuresFromFiles);
        if (diff2.length) {
          logger.warning(`Warning! Values for measures described in ${measuresSchema.fileName} are missing: ${diff2}`);
        }
        return 0;
      });

      // compare and validate dimension IDs
      dimensions$.combineLatest(dimensionsFromMvFiles$, (dimensionsFromCsv, dimensionsFromFiles) => {
        // check missing measure in measures.csv
        const diff1 = _.difference(dimensionsFromFiles, dimensionsFromCsv);
        if (diff1.length) {
          logger.warning(`Warning! Please add dimensions to ${dimensionsSchema.fileName} ${diff1}`);
        }
        // check missing measure values in folder
        const diff2 = _.difference(dimensionsFromCsv, dimensionsFromFiles);
        if (diff2.length) {
          logger.warning(`Warning! Values for dimensions described in ${dimensionsSchema.fileName} are missing: ${diff2}`);
        }
        return 0;
      });

      // build dimension values hash map
      // return { dimension_id: {dimension_value_id: true} }
      const dimensionsValuesIndex$ = require('./lib/ddf-dimension-values-index.data')(folderPath);
      const measuresData$ = require('./lib/ddf-measure-values.data')(folderPath);

      // 1. check dimension ids
      // unknown dimension ids
      // missing dimension ids
      // unexpected dimension ids
      const measureValuesChecker = require('./lib/ddf-measure-values.validator');
      // 2. check data points
      // report missing measure values data points
      // like abkh 1983
      const dataPointsChecker = require('./lib/ddf-data-points.validator');

      let options = [
        measureValuesChecker(dimensionsValuesIndex$, measuresData$)
      ];

      // data points will be checked
      if (settings.gapsSupportDimensions) {
        settings.gapsSupportDimensions.forEach(dimension =>
          options.push(dataPointsChecker(dimension, dimensionsValuesIndex$, measuresData$)));
      }

      // todo: change apply to spread operator when implemented in node
      rx.Observable.merge.apply(null, options)
        .subscribe(x => logger.results(x), x => logger.error(x.stack));
    })
    .subscribe();
}

require('./lib/ddf-validate-folder')(logger, ddfRootFolderValidator.ddfFolders$)
  .subscribe(x => logger.results(x), x => logger.error(x.stack));

validateMeasureValues(ddfRootFolderValidator.ddfFolders$);
