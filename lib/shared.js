const measureValuesValidatorSchema = require('../ddf-schema/ddf-measure-values.schema');

// looking for only appropriate dimension value
// for example, for 'country' file we should process only
// dimensions with 'is.country' field === 'TRUE'
exports.isExpectedDimension = (fileName, dimensionsHash, dimensionKey, expectedField) =>
  measureValuesValidatorSchema
    .dimensions(fileName)
    .reduce((res, dimensionForTest) => {
      const dimensionTypeByMeasure =
        dimensionsHash[dimensionKey][expectedField][dimensionForTest];
      if (dimensionTypeByMeasure && dimensionTypeByMeasure.toLowerCase() === 'true') {
        res = true;
      }

      return res;
    }, false);
