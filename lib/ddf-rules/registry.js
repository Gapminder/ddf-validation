'use strict';

exports.UNEXPECTED_DATA = Symbol.for('UNEXPECTED_DATA');
exports.EMPTY_DATA = Symbol.for('EMPTY_DATA');
exports.NON_DDF_DATA_SET = Symbol.for('NON_DDF_DATA_SET');
exports.NON_DDF_FOLDER = Symbol.for('NON_DDF_FOLDER');
exports.INCORRECT_FILE = Symbol.for('INCORRECT_FILE');
exports.INCORRECT_JSON_FIELD = Symbol.for('INCORRECT_JSON_FIELD');
exports.CONCEPT_ID_IS_NOT_UNIQUE = Symbol.for('CONCEPT_ID_IS_NOT_UNIQUE');
exports.EMPTY_CONCEPT_ID = Symbol.for('EMPTY_CONCEPT_ID');
exports.INCORRECT_IDENTIFIER = Symbol.for('INCORRECT_IDENTIFIER');
exports.NON_CONCEPT_HEADER = Symbol.for('NON_CONCEPT_HEADER');
exports.INVALID_DRILL_UP = Symbol.for('INVALID_DRILL_UP');
exports.MEASURE_VALUE_NOT_NUMERIC = Symbol.for('MEASURE_VALUE_NOT_NUMERIC');
exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_ENTITY_VALUE');
exports.DATA_POINT_UNEXPECTED_TIME_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_TIME_VALUE');
exports.WRONG_DATA_POINT_HEADER = Symbol.for('WRONG_DATA_POINT_HEADER');
exports.WRONG_ENTITY_IS_HEADER = Symbol.for('WRONG_ENTITY_IS_HEADER');
exports.WRONG_ENTITY_IS_VALUE = Symbol.for('WRONG_ENTITY_IS_VALUE');
exports.NON_UNIQUE_ENTITY_VALUE = Symbol.for('NON_UNIQUE_ENTITY_VALUE');
exports.CONCEPT_MANDATORY_FIELD_NOT_FOUND = Symbol.for('CONCEPT_MANDATORY_FIELD_NOT_FOUND');
exports.CONCEPTS_NOT_FOUND = Symbol.for('CONCEPTS_NOT_FOUND');
exports.DATAPACKAGE_CONFUSED_FIELDS = Symbol.for('DATAPACKAGE_CONFUSED_FIELDS');
exports.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY = Symbol.for('DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY');
exports.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME = Symbol.for('DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME');
exports.DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE = Symbol.for('DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE');
exports.UNEXPECTED_TRANSLATION_HEADER = Symbol.for('UNEXPECTED_TRANSLATION_HEADER');
exports.UNEXPECTED_TRANSLATIONS_DATA = Symbol.for('UNEXPECTED_TRANSLATIONS_DATA');
exports.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA = Symbol.for('UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA');

exports.WARNING_TAG = Symbol.for('WARNING');
exports.WAFFLE_SERVER_TAG = Symbol.for('WAFFLE_SERVER');
exports.FILE_SYSTEM_TAG = Symbol.for('FILE_SYSTEM');
exports.DATAPOINT_TAG = Symbol.for('DATAPOINT');
exports.TRANSLATION_TAG = Symbol.for('TRANSLATION');

function tagsToString(tags) {
  return tags.map(tag => Symbol.keyFor(tag));
}

exports.tags = {
  [exports.UNEXPECTED_DATA]: [exports.FILE_SYSTEM_TAG, exports.WAFFLE_SERVER_TAG],
  [exports.EMPTY_DATA]: [exports.WARNING_TAG],
  [exports.NON_DDF_DATA_SET]: [exports.FILE_SYSTEM_TAG],
  [exports.NON_DDF_FOLDER]: [exports.WARNING_TAG, exports.FILE_SYSTEM_TAG],
  [exports.INCORRECT_FILE]: [exports.FILE_SYSTEM_TAG],
  [exports.INCORRECT_JSON_FIELD]: [exports.WARNING_TAG],
  [exports.CONCEPT_ID_IS_NOT_UNIQUE]: [exports.WAFFLE_SERVER_TAG],
  [exports.EMPTY_CONCEPT_ID]: [exports.WAFFLE_SERVER_TAG],
  [exports.INCORRECT_IDENTIFIER]: [exports.WAFFLE_SERVER_TAG],
  [exports.NON_CONCEPT_HEADER]: [exports.WAFFLE_SERVER_TAG],
  [exports.INVALID_DRILL_UP]: [exports.WAFFLE_SERVER_TAG],
  [exports.MEASURE_VALUE_NOT_NUMERIC]: [exports.WARNING_TAG, exports.DATAPOINT_TAG],
  [exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: [exports.WAFFLE_SERVER_TAG, exports.DATAPOINT_TAG],
  [exports.DATA_POINT_UNEXPECTED_TIME_VALUE]: [exports.WAFFLE_SERVER_TAG, exports.DATAPOINT_TAG],
  [exports.WRONG_DATA_POINT_HEADER]: [exports.WAFFLE_SERVER_TAG, exports.DATAPOINT_TAG],
  [exports.WRONG_ENTITY_IS_HEADER]: [],
  [exports.WRONG_ENTITY_IS_VALUE]: [],
  [exports.NON_UNIQUE_ENTITY_VALUE]: [exports.WAFFLE_SERVER_TAG],
  [exports.CONCEPT_MANDATORY_FIELD_NOT_FOUND]: [exports.WAFFLE_SERVER_TAG],
  [exports.CONCEPTS_NOT_FOUND]: [exports.WAFFLE_SERVER_TAG],
  [exports.DATAPACKAGE_CONFUSED_FIELDS]: [exports.WAFFLE_SERVER_TAG],
  [exports.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY]: [exports.WAFFLE_SERVER_TAG],
  [exports.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: [exports.WAFFLE_SERVER_TAG],
  [exports.DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: [exports.WAFFLE_SERVER_TAG],
  [exports.UNEXPECTED_TRANSLATION_HEADER]: [exports.WAFFLE_SERVER_TAG, exports.TRANSLATION_TAG],
  [exports.UNEXPECTED_TRANSLATIONS_DATA]: [exports.WAFFLE_SERVER_TAG, exports.TRANSLATION_TAG],
  [exports.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: [exports.WAFFLE_SERVER_TAG, exports.TRANSLATION_TAG]
};

exports.descriptions = {
  [exports.UNEXPECTED_DATA]: `Unexpected data: wrong CSV.
  An issue according to this rule will be fired when filename and header are good but content isn't: content`,
  [exports.EMPTY_DATA]: `Empty data. An issue according to this rule will be fired when file with true name 
  and header does not contain any data under the header.`,
  [exports.NON_DDF_DATA_SET]: 'This data set is not DDF',
  [exports.NON_DDF_FOLDER]: 'This folder is not DDF',
  [exports.INCORRECT_FILE]: 'Incorrect file',
  [exports.INCORRECT_JSON_FIELD]: 'Incorrect JSON field',
  [exports.CONCEPT_ID_IS_NOT_UNIQUE]: 'Concept Id is not unique',
  [exports.EMPTY_CONCEPT_ID]: `Empty concept ID. An issue according to this rule will be fired 
  when concept ID ('concept' header) is empty`,
  [exports.INCORRECT_IDENTIFIER]: `Incorrect identifier. 
  Entity identifiers and concept identifiers can only contain lowercase alphanumeric 
  characters and underscores.`,
  [exports.NON_CONCEPT_HEADER]: `Non concept header. 
  Each part of any header should be concept (is-- fields are excluded in this case)`,
  [exports.INVALID_DRILL_UP]: `Invalid Drill Up.
  An issue according to this rule will be fired when drill up in concept is defined and not valid: 
  not a set of valid concepts`,
  [exports.MEASURE_VALUE_NOT_NUMERIC]: 'Measure in data point has not numeric type',
  [exports.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: 'Unexpected entity value in the data point',
  [exports.DATA_POINT_UNEXPECTED_TIME_VALUE]: 'Unexpected time value in the data point',
  [exports.WRONG_DATA_POINT_HEADER]: `Invalid concept in data point.
  Raised when header contains a concept based on 'string' type`,
  [exports.WRONG_ENTITY_IS_HEADER]: `Wrong "is" header. An issue according to this rule 
  will be fired when 'is-header' in concept is defined and not valid: 
  not a concept with 'entity_set' type`,
  [exports.WRONG_ENTITY_IS_VALUE]: `Wrong value for "is" header.
  An issue according to this rule will be fired when 
  value under 'is-' header doesn't look like boolean`,
  [exports.NON_UNIQUE_ENTITY_VALUE]: `Non unique entity value.
  An issue according to this rule will be fired when id value entity 
  (under particular kind of entity, geo-country, for example) is not unique.`,
  [exports.CONCEPT_MANDATORY_FIELD_NOT_FOUND]: `Concept mandatory field is not found. 
  Mandatory fields for ALL concepts are not defined
  However, for entity sets and roles a domain is mandatory.
  So a concept which has 'concept_type' 'entity_set' or 'role', the 'concept' property 'domain' is mandatory.
  For 'entity_set', 'domain' should be an 'entity_domain' defined elsewhere in the dataset.
  For 'role', 'domain' should be an 'entity_set' or 'entity_domain' defined elsewhere in the dataset.
  For 'measure', 'domain' is optional.`,
  [exports.CONCEPTS_NOT_FOUND]: `Concepts are not found. 
  An issue according to this rule will be fired when concepts 
  will not be detected for current DDF dataset.`,
  [exports.DATAPACKAGE_CONFUSED_FIELDS]: 'Confused fields in datapackage.json',
  [exports.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY]: 'Non concept primary key in datapackage.json',
  [exports.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: 'Non unique resource name in datapackage.json',
  [exports.DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: 'Non unique resource file in datapackage.json',
  [exports.UNEXPECTED_TRANSLATION_HEADER]: 'Unexpected translation header',
  [exports.UNEXPECTED_TRANSLATIONS_DATA]: 'Unexpected translations data: primary key is not consistent',
  [exports.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: `Unexpected translations datapoint data: 
  primary key is not consistent`
};

exports.getRulesInformation = () => Object.getOwnPropertySymbols(exports.descriptions)
  .reduce((result, issueType) =>
    `${result}${Symbol.keyFor(issueType)} -> ${exports.descriptions[issueType]}
      tags: ${tagsToString(exports.tags[issueType])}\n\n`, 'Supported rules are:\n\n');
