module.exports = (logger, ddfFolders$) => ddfFolders$
  .do(x => logger.notice(`Validating ddf folder ${x}`))
  .mergeMap(folderPath => {
    // validate dimensions file
    const dimensionsFile$ = require('../ddf-utils/rx-read-dimension')(folderPath);
    const isDimensionsValid = require('./ddf-dimensions.validator')
    (folderPath, dimensionsFile$);

    // validate measures file
    const measuresFile$ = require('../ddf-utils/rx-read-measures')(folderPath);
    const isMeasuresValid = require('./ddf-measures.validator')(folderPath, measuresFile$);

    // validate dimensions&measures unique ids
    const isIdUnique = require('./ddf-dimensions-and-measures-unique-id.validator.js')
    (folderPath, dimensionsFile$, measuresFile$);

    return isDimensionsValid
      .combineLatest([isMeasuresValid, isIdUnique], (a, b, c)=> {
        return a.concat(b).concat(c);
      });
  });
