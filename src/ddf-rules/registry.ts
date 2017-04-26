export const UNEXPECTED_DATA = Symbol.for('UNEXPECTED_DATA');
export const EMPTY_DATA = Symbol.for('EMPTY_DATA');
export const NON_DDF_DATA_SET = Symbol.for('NON_DDF_DATA_SET');
export const NON_DDF_FOLDER = Symbol.for('NON_DDF_FOLDER');
export const INCORRECT_FILE = Symbol.for('INCORRECT_FILE');
export const INCORRECT_JSON_FIELD = Symbol.for('INCORRECT_JSON_FIELD');
export const CONCEPT_ID_IS_NOT_UNIQUE = Symbol.for('CONCEPT_ID_IS_NOT_UNIQUE');
export const EMPTY_CONCEPT_ID = Symbol.for('EMPTY_CONCEPT_ID');
export const INCORRECT_IDENTIFIER = Symbol.for('INCORRECT_IDENTIFIER');
export const NON_CONCEPT_HEADER = Symbol.for('NON_CONCEPT_HEADER');
export const INVALID_DRILL_UP = Symbol.for('INVALID_DRILL_UP');
export const MEASURE_VALUE_NOT_NUMERIC = Symbol.for('MEASURE_VALUE_NOT_NUMERIC');
export const DATA_POINT_UNEXPECTED_ENTITY_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_ENTITY_VALUE');
export const DATA_POINT_UNEXPECTED_TIME_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_TIME_VALUE');
export const WRONG_DATA_POINT_HEADER = Symbol.for('WRONG_DATA_POINT_HEADER');
export const WRONG_ENTITY_IS_HEADER = Symbol.for('WRONG_ENTITY_IS_HEADER');
export const WRONG_ENTITY_IS_VALUE = Symbol.for('WRONG_ENTITY_IS_VALUE');
export const NON_UNIQUE_ENTITY_VALUE = Symbol.for('NON_UNIQUE_ENTITY_VALUE');
export const CONCEPT_MANDATORY_FIELD_NOT_FOUND = Symbol.for('CONCEPT_MANDATORY_FIELD_NOT_FOUND');
export const CONCEPTS_NOT_FOUND = Symbol.for('CONCEPTS_NOT_FOUND');
export const DATAPACKAGE_CONFUSED_FIELDS = Symbol.for('DATAPACKAGE_CONFUSED_FIELDS');
export const DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY = Symbol.for('DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY');
export const DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME = Symbol.for('DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME');
export const DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE = Symbol.for('DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE');
export const UNEXPECTED_TRANSLATION_HEADER = Symbol.for('UNEXPECTED_TRANSLATION_HEADER');
export const UNEXPECTED_TRANSLATIONS_DATA = Symbol.for('UNEXPECTED_TRANSLATIONS_DATA');
export const UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA = Symbol.for('UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA');
export const DUPLICATED_DATA_POINT_TRANSLATION_KEY = Symbol.for('DUPLICATED_DATA_POINT_TRANSLATION_KEY');
export const DUPLICATED_TRANSLATION_KEY = Symbol.for('DUPLICATED_TRANSLATION_KEY');
export const DATA_POINT_WITHOUT_INDICATOR = Symbol.for('DATA_POINT_WITHOUT_INDICATOR');
export const UNEXISTING_CONSTRAINT_VALUE = Symbol.for('UNEXISTING_CONSTRAINT_VALUE');
export const DATA_POINT_CONSTRAINT_VIOLATION = Symbol.for('DATA_POINT_CONSTRAINT_VIOLATION');
export const DUPLICATED_DATA_POINT_KEY = Symbol.for('DUPLICATED_DATA_POINT_KEY');

export const WARNING_TAG = Symbol.for('WARNING');
export const FILE_SYSTEM_TAG = Symbol.for('FILE_SYSTEM');
export const DATAPOINT_TAG = Symbol.for('DATAPOINT');
export const TRANSLATION_TAG = Symbol.for('TRANSLATION');

function tagsToString(tags: any[]) {
  return tags.map(tag => Symbol.keyFor(tag));
}

export const tags: any = {
  [UNEXPECTED_DATA]: [FILE_SYSTEM_TAG],
  [EMPTY_DATA]: [WARNING_TAG],
  [NON_DDF_DATA_SET]: [FILE_SYSTEM_TAG],
  [NON_DDF_FOLDER]: [WARNING_TAG, FILE_SYSTEM_TAG],
  [INCORRECT_FILE]: [FILE_SYSTEM_TAG],
  [INCORRECT_JSON_FIELD]: [WARNING_TAG],
  [CONCEPT_ID_IS_NOT_UNIQUE]: [],
  [EMPTY_CONCEPT_ID]: [],
  [INCORRECT_IDENTIFIER]: [],
  [NON_CONCEPT_HEADER]: [],
  [INVALID_DRILL_UP]: [],
  [MEASURE_VALUE_NOT_NUMERIC]: [WARNING_TAG, DATAPOINT_TAG],
  [DATA_POINT_UNEXPECTED_ENTITY_VALUE]: [DATAPOINT_TAG],
  [DATA_POINT_UNEXPECTED_TIME_VALUE]: [DATAPOINT_TAG],
  [WRONG_DATA_POINT_HEADER]: [DATAPOINT_TAG],
  [WRONG_ENTITY_IS_HEADER]: [],
  [WRONG_ENTITY_IS_VALUE]: [],
  [NON_UNIQUE_ENTITY_VALUE]: [],
  [CONCEPT_MANDATORY_FIELD_NOT_FOUND]: [],
  [CONCEPTS_NOT_FOUND]: [],
  [DATAPACKAGE_CONFUSED_FIELDS]: [],
  [DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY]: [],
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: [],
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: [],
  [UNEXPECTED_TRANSLATION_HEADER]: [TRANSLATION_TAG],
  [UNEXPECTED_TRANSLATIONS_DATA]: [TRANSLATION_TAG],
  [UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: [TRANSLATION_TAG, DATAPOINT_TAG],
  [DUPLICATED_DATA_POINT_TRANSLATION_KEY]: [TRANSLATION_TAG, DATAPOINT_TAG],
  [DUPLICATED_TRANSLATION_KEY]: [TRANSLATION_TAG],
  [DATA_POINT_WITHOUT_INDICATOR]: [DATAPOINT_TAG],
  [UNEXISTING_CONSTRAINT_VALUE]: [],
  [DATA_POINT_CONSTRAINT_VIOLATION]: [DATAPOINT_TAG],
  [DUPLICATED_DATA_POINT_KEY]: [DATAPOINT_TAG]
};

export const descriptions = {
  [UNEXPECTED_DATA]: `Unexpected data: wrong CSV.
  An issue according to this rule will be fired when filename and header are good but content isn't: content`,
  [EMPTY_DATA]: `Empty data. An issue according to this rule will be fired when file with true name 
  and header does not contain any data under the header.`,
  [NON_DDF_DATA_SET]: 'This data set is not DDF',
  [NON_DDF_FOLDER]: 'This folder is not DDF',
  [INCORRECT_FILE]: 'Incorrect file',
  [INCORRECT_JSON_FIELD]: 'Incorrect JSON field',
  [CONCEPT_ID_IS_NOT_UNIQUE]: 'Concept Id is not unique',
  [EMPTY_CONCEPT_ID]: `Empty concept ID. An issue according to this rule will be fired 
  when concept ID ('concept' header) is empty`,
  [INCORRECT_IDENTIFIER]: `Incorrect identifier. 
  Entity identifiers and concept identifiers can only contain lowercase alphanumeric 
  characters and underscores.`,
  [NON_CONCEPT_HEADER]: `Non concept header. 
  Each part of any header should be concept (is-- fields are excluded in this case)`,
  [INVALID_DRILL_UP]: `Invalid Drill Up.
  An issue according to this rule will be fired when drill up in concept is defined and not valid: 
  not a set of valid concepts`,
  [MEASURE_VALUE_NOT_NUMERIC]: 'Measure in data point has not numeric type',
  [DATA_POINT_UNEXPECTED_ENTITY_VALUE]: 'Unexpected entity value in the data point',
  [DATA_POINT_UNEXPECTED_TIME_VALUE]: 'Unexpected time value in the data point',
  [WRONG_DATA_POINT_HEADER]: `Invalid concept in data point.
  Raised when header contains a concept based on 'string' type`,
  [WRONG_ENTITY_IS_HEADER]: `Wrong "is" header. An issue according to this rule 
  will be fired when 'is-header' in concept is defined and not valid: 
  not a concept with 'entity_set' type`,
  [WRONG_ENTITY_IS_VALUE]: `Wrong value for "is" header.
  An issue according to this rule will be fired when 
  value under 'is-' header doesn't look like boolean`,
  [NON_UNIQUE_ENTITY_VALUE]: `Non unique entity value.
  An issue according to this rule will be fired when id value entity 
  (under particular kind of entity, geo-country, for example) is not unique.`,
  [CONCEPT_MANDATORY_FIELD_NOT_FOUND]: `Concept mandatory field is not found. 
  Mandatory fields for ALL concepts are not defined
  However, for entity sets and roles a domain is mandatory.
  So a concept which has 'concept_type' 'entity_set' or 'role', the 'concept' property 'domain' is mandatory.
  For 'entity_set', 'domain' should be an 'entity_domain' defined elsewhere in the dataset.
  For 'role', 'domain' should be an 'entity_set' or 'entity_domain' defined elsewhere in the dataset.
  For 'measure', 'domain' is optional.`,
  [CONCEPTS_NOT_FOUND]: `Concepts are not found. 
  An issue according to this rule will be fired when concepts 
  will not be detected for current DDF dataset.`,
  [DATAPACKAGE_CONFUSED_FIELDS]: 'Confused fields in datapackage.json',
  [DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY]: 'Non concept primary key in datapackage.json',
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: 'Non unique resource name in datapackage.json',
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: 'Non unique resource file in datapackage.json',
  [UNEXPECTED_TRANSLATION_HEADER]: 'Unexpected translation header',
  [UNEXPECTED_TRANSLATIONS_DATA]: 'Unexpected translations data: primary key is not consistent',
  [UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: `Unexpected translations datapoint data: 
  primary key is not consistent`,
  [DUPLICATED_DATA_POINT_TRANSLATION_KEY]: 'Duplicated data point translation key',
  [DUPLICATED_TRANSLATION_KEY]: 'Duplicated translation key',
  [DATA_POINT_WITHOUT_INDICATOR]: 'Datapoint without indicator: primary key is equal fields in datapackage.json resource',
  [UNEXISTING_CONSTRAINT_VALUE]: 'Constraint value that described in datapackage.json is not a valid entity value',
  [DATA_POINT_CONSTRAINT_VIOLATION]: 'Constraint violation for particular datapoint. See datapackage.json format.',
  [DUPLICATED_DATA_POINT_KEY]: 'Duplicated datapoint primary key'
};

export const getRulesInformation = () => Object.getOwnPropertySymbols(exports.descriptions)
  .reduce((result, issueType) =>
    `${result}${Symbol.keyFor(issueType)} -> ${exports.descriptions[issueType]}
      tags: ${tagsToString(exports.tags[issueType])}\n\n`, 'Supported rules are:\n\n');
