export const UNEXPECTED_DATA = Symbol.for('UNEXPECTED_DATA');
export const EMPTY_DATA = Symbol.for('EMPTY_DATA');
export const NON_DDF_DATA_SET = Symbol.for('NON_DDF_DATA_SET');
export const INCORRECT_FILE = Symbol.for('INCORRECT_FILE');
export const INCORRECT_JSON_FIELD = Symbol.for('INCORRECT_JSON_FIELD');
export const CONCEPT_ID_IS_NOT_UNIQUE = Symbol.for('CONCEPT_ID_IS_NOT_UNIQUE');
export const INCORRECT_CONCEPT_TYPE = Symbol.for('INCORRECT_CONCEPT_TYPE');
export const EMPTY_CONCEPT_ID = Symbol.for('EMPTY_CONCEPT_ID');
export const EMPTY_ENTITY_ID = Symbol.for('EMPTY_ENTITY_ID');
export const INCORRECT_IDENTIFIER = Symbol.for('INCORRECT_IDENTIFIER');
export const NON_CONCEPT_HEADER = Symbol.for('NON_CONCEPT_HEADER');
export const INVALID_DRILL_UP = Symbol.for('INVALID_DRILL_UP');
export const MEASURE_VALUE_NOT_NUMERIC = Symbol.for('MEASURE_VALUE_NOT_NUMERIC');
export const DATA_POINT_UNEXPECTED_ENTITY_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_ENTITY_VALUE');
export const DATA_POINT_UNEXPECTED_TIME_VALUE = Symbol.for('DATA_POINT_UNEXPECTED_TIME_VALUE');
export const WRONG_DATA_POINT_HEADER = Symbol.for('WRONG_DATA_POINT_HEADER');
export const SAME_KEY_VALUE_CONCEPT = Symbol.for('SAME_KEY_VALUE_CONCEPT');
export const WRONG_ENTITY_IS_HEADER = Symbol.for('WRONG_ENTITY_IS_HEADER');
export const WRONG_ENTITY_IS_VALUE = Symbol.for('WRONG_ENTITY_IS_VALUE');
export const NON_UNIQUE_ENTITY_VALUE = Symbol.for('NON_UNIQUE_ENTITY_VALUE');
export const CONCEPT_MANDATORY_FIELD_NOT_FOUND = Symbol.for('CONCEPT_MANDATORY_FIELD_NOT_FOUND');
export const CONCEPTS_NOT_FOUND = Symbol.for('CONCEPTS_NOT_FOUND');
export const DATAPACKAGE_INCORRECT_FIELDS = Symbol.for('DATAPACKAGE_INCORRECT_FIELDS');
export const DATAPACKAGE_NON_CONCEPT_FIELD = Symbol.for('DATAPACKAGE_NON_CONCEPT_FIELD');
export const DATAPACKAGE_INCORRECT_PRIMARY_KEY = Symbol.for('DATAPACKAGE_INCORRECT_PRIMARY_KEY');
export const DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME = Symbol.for('DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME');
export const DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE = Symbol.for('DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE');
export const DATAPACKAGE_NONEXISTENT_RESOURCE = Symbol.for('DATAPACKAGE_NONEXISTENT_RESOURCE');
export const DATAPACKAGE_NONEXISTENT_CONCEPT = Symbol.for('DATAPACKAGE_NONEXISTENT_CONCEPT');
export const INCONSISTENT_DATAPACKAGE = Symbol.for('INCONSISTENT_DATAPACKAGE');
export const UNEXPECTED_TRANSLATION_HEADER = Symbol.for('UNEXPECTED_TRANSLATION_HEADER');
export const UNEXPECTED_TRANSLATIONS_DATA = Symbol.for('UNEXPECTED_TRANSLATIONS_DATA');
export const UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA = Symbol.for('UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA');
export const DUPLICATED_DATA_POINT_TRANSLATION_KEY = Symbol.for('DUPLICATED_DATA_POINT_TRANSLATION_KEY');
export const DUPLICATED_TRANSLATION_KEY = Symbol.for('DUPLICATED_TRANSLATION_KEY');
export const DATA_POINT_WITHOUT_INDICATOR = Symbol.for('DATA_POINT_WITHOUT_INDICATOR');
export const UNEXISTING_CONSTRAINT_VALUE = Symbol.for('UNEXISTING_CONSTRAINT_VALUE');
export const DATA_POINT_CONSTRAINT_VIOLATION = Symbol.for('DATA_POINT_CONSTRAINT_VIOLATION');
export const DUPLICATED_DATA_POINT_KEY = Symbol.for('DUPLICATED_DATA_POINT_KEY');
export const INCORRECT_BOOLEAN_ENTITY = Symbol.for('INCORRECT_BOOLEAN_ENTITY');
export const CONCEPT_LOOKS_LIKE_BOOLEAN = Symbol.for('CONCEPT_LOOKS_LIKE_BOOLEAN');
export const ENTITY_VALUE_AS_ENTITY_NAME = Symbol.for('ENTITY_VALUE_AS_ENTITY_NAME');
export const DUPLICATED_SYNONYM_KEY = Symbol.for('DUPLICATED_SYNONYM_KEY');
export const INCONSISTENT_SYNONYM_KEY = Symbol.for('INCONSISTENT_SYNONYM_KEY');

export const WARNING_TAG = Symbol.for('WARNING');
export const FILE_SYSTEM_TAG = Symbol.for('FILE_SYSTEM');
export const DATAPOINT_TAG = Symbol.for('DATAPOINT');
export const TRANSLATION_TAG = Symbol.for('TRANSLATION');
export const DATAPACKAGE_TAG = Symbol.for('DATAPACKAGE_TAG');
export const WAFFLE_SERVER_TAG = Symbol.for('WAFFLE_SERVER_TAG');

function tagsToString(tags: any[]) {
  return tags.map(tag => Symbol.keyFor(tag));
}

export const tags: any = {
  [UNEXPECTED_DATA]: [FILE_SYSTEM_TAG],
  [EMPTY_DATA]: [WARNING_TAG],
  [NON_DDF_DATA_SET]: [FILE_SYSTEM_TAG],
  [INCORRECT_FILE]: [FILE_SYSTEM_TAG, DATAPACKAGE_TAG],
  [INCORRECT_JSON_FIELD]: [WARNING_TAG],
  [CONCEPT_ID_IS_NOT_UNIQUE]: [],
  [INCORRECT_CONCEPT_TYPE]: [],
  [EMPTY_CONCEPT_ID]: [],
  [EMPTY_ENTITY_ID]: [],
  [INCORRECT_IDENTIFIER]: [],
  [NON_CONCEPT_HEADER]: [],
  [INVALID_DRILL_UP]: [],
  [MEASURE_VALUE_NOT_NUMERIC]: [WARNING_TAG, DATAPOINT_TAG],
  [DATA_POINT_UNEXPECTED_ENTITY_VALUE]: [DATAPOINT_TAG],
  [DATA_POINT_UNEXPECTED_TIME_VALUE]: [DATAPOINT_TAG],
  [WRONG_DATA_POINT_HEADER]: [DATAPOINT_TAG],
  [SAME_KEY_VALUE_CONCEPT]: [DATAPACKAGE_TAG],
  [DATAPACKAGE_NONEXISTENT_RESOURCE]: [DATAPACKAGE_TAG],
  [DATAPACKAGE_NONEXISTENT_CONCEPT]: [DATAPACKAGE_TAG],
  [INCONSISTENT_DATAPACKAGE]: [DATAPACKAGE_TAG],
  [WRONG_ENTITY_IS_HEADER]: [],
  [WRONG_ENTITY_IS_VALUE]: [],
  [NON_UNIQUE_ENTITY_VALUE]: [],
  [CONCEPT_MANDATORY_FIELD_NOT_FOUND]: [],
  [CONCEPTS_NOT_FOUND]: [],
  [DATAPACKAGE_INCORRECT_FIELDS]: [DATAPACKAGE_TAG],
  [DATAPACKAGE_NON_CONCEPT_FIELD]: [DATAPACKAGE_TAG],
  [DATAPACKAGE_INCORRECT_PRIMARY_KEY]: [DATAPACKAGE_TAG],
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: [DATAPACKAGE_TAG],
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: [DATAPACKAGE_TAG],
  [UNEXPECTED_TRANSLATION_HEADER]: [TRANSLATION_TAG],
  [UNEXPECTED_TRANSLATIONS_DATA]: [TRANSLATION_TAG],
  [UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: [TRANSLATION_TAG, DATAPOINT_TAG],
  [DUPLICATED_DATA_POINT_TRANSLATION_KEY]: [TRANSLATION_TAG, DATAPOINT_TAG],
  [DUPLICATED_TRANSLATION_KEY]: [TRANSLATION_TAG],
  [DATA_POINT_WITHOUT_INDICATOR]: [DATAPOINT_TAG],
  [UNEXISTING_CONSTRAINT_VALUE]: [],
  [DATA_POINT_CONSTRAINT_VIOLATION]: [DATAPOINT_TAG],
  [DUPLICATED_DATA_POINT_KEY]: [DATAPOINT_TAG],
  [INCORRECT_BOOLEAN_ENTITY]: [],
  [CONCEPT_LOOKS_LIKE_BOOLEAN]: [WARNING_TAG],
  [ENTITY_VALUE_AS_ENTITY_NAME]: [WAFFLE_SERVER_TAG, WARNING_TAG],
  [DUPLICATED_SYNONYM_KEY]: [],
  [INCONSISTENT_SYNONYM_KEY]: []
};

export const descriptions = {
  [UNEXPECTED_DATA]: 'Invalid CSV file is found. Number of columns in header does not match that of each row.',
  [EMPTY_DATA]: 'Empty data found in CSV. Filename and header are good, but no further data follows.',
  [NON_DDF_DATA_SET]: 'The folder content is not recognized as a DDFCSV dataset.',
  [INCORRECT_FILE]: 'Error reading a file.',
  [INCORRECT_JSON_FIELD]: 'Incorrect JSON field.',
  [CONCEPT_ID_IS_NOT_UNIQUE]: 'Concept Id is not unique.',
  [INCORRECT_CONCEPT_TYPE]: 'Concept type does not correspond to any of the available DDF concept types.',
  [EMPTY_CONCEPT_ID]: 'Empty concept ID is found.',
  [EMPTY_ENTITY_ID]: 'Empty entity ID is found.',
  [INCORRECT_IDENTIFIER]: 'Incorrect identifier is found.',
  [NON_CONCEPT_HEADER]: 'Found a value in header that is not among the concepts.',
  [INVALID_DRILL_UP]: 'Invalid Drill Up property value is found.',
  [MEASURE_VALUE_NOT_NUMERIC]: 'Measure has non-numeric value(s).',
  [DATA_POINT_UNEXPECTED_ENTITY_VALUE]: 'Datapoint refers to a missing or a misspelled entity.',
  [DATA_POINT_UNEXPECTED_TIME_VALUE]: 'Datapoint has an incorrect time value.',
  [WRONG_DATA_POINT_HEADER]: 'Invalid datapoint file header. One of the keys has an incorrect concept_type or key from datapackage does not correspond with header of the file.',
  [SAME_KEY_VALUE_CONCEPT]: 'Datapackage: Key-value pair is found in datapackage.json where the key contains the same concept(s) as does the value.',
  [WRONG_ENTITY_IS_HEADER]: 'Incorrect "is" entity property header. It may only reference a concept of type "entity_set".',
  [WRONG_ENTITY_IS_VALUE]: 'Incorrect value found in the column with "is" header. Only boolean values are allowed.',
  [NON_UNIQUE_ENTITY_VALUE]: 'A non-unique entity value was found within an entity domain.',
  [CONCEPT_MANDATORY_FIELD_NOT_FOUND]: 'A concept is missing a mandatory property. Mandatory fields are not the same for all concept types.',
  [CONCEPTS_NOT_FOUND]: 'Concepts are not found.',
  [DATAPACKAGE_INCORRECT_FIELDS]: 'Datapackage: Incorrect fields found in datapackage.json.',
  [DATAPACKAGE_NON_CONCEPT_FIELD]: 'Datapackage: Non-concept primary key found in datapackage.json.',
  [DATAPACKAGE_INCORRECT_PRIMARY_KEY]: 'Datapackage: Fields section does not contain primary key.',
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: 'Datapackage: Non-unique resource name found in datapackage.json.',
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: 'Datapackage: Non-unique resource file found in datapackage.json.',
  [DATAPACKAGE_NONEXISTENT_RESOURCE]: 'Resource found in datapackage that is not present in folder',
  [DATAPACKAGE_NONEXISTENT_CONCEPT]: 'Concept found in datapackage but is not listed in concepts table',
  [INCONSISTENT_DATAPACKAGE]: 'datapackage.json does not meet "Data Package" requirements (https://frictionlessdata.io/specs/data-package/) or some mandatory sections are missing',
  [UNEXPECTED_TRANSLATION_HEADER]: 'Translations: Unexpected header in translation files',
  [UNEXPECTED_TRANSLATIONS_DATA]: 'Translations: Unexpected translations data: primary key is not consistent.',
  [UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: 'Translations: Unexpected translations datapoint data: primary key is not consistent.',
  [DUPLICATED_DATA_POINT_TRANSLATION_KEY]: 'Translations: Duplicated data point translation key.',
  [DUPLICATED_TRANSLATION_KEY]: 'Translations: Duplicated translation key.',
  [DATA_POINT_WITHOUT_INDICATOR]: 'Datapackage: Found a datapoint file description without an indicator: primary key array is equal to fields array.',
  [UNEXISTING_CONSTRAINT_VALUE]: 'Datapackage: Constraint value listed in datapackage.json is not a valid entity value.',
  [DATA_POINT_CONSTRAINT_VIOLATION]: 'Constraint violation for particular datapoint.',
  [DUPLICATED_DATA_POINT_KEY]: 'Duplicated key is found in datapoint file.',
  [INCORRECT_BOOLEAN_ENTITY]: 'Boolean entitiy field has an incorrect value.',
  [CONCEPT_LOOKS_LIKE_BOOLEAN]: 'Entity contains values that look like boolean, but related entity field has a different type.',
  [ENTITY_VALUE_AS_ENTITY_NAME]: 'Entity value should not be equal to entity domain name or entity set name. This rule providing is critical for DDFQL and DDF reader supporting (on WS).',
  [DUPLICATED_SYNONYM_KEY]: 'Duplicated synonym key',
  [INCONSISTENT_SYNONYM_KEY]: 'Inconsistent Synonym key'
};

export const howToFix = {
  [UNEXPECTED_DATA]: 'The additional info should tell which CSV file is corrupted. Use csvlint.io to find the issues inside the CSV files.',
  [EMPTY_DATA]: 'All CSV files in the dataset should have at least one row beyond the header or need to be removed',
  [NON_DDF_DATA_SET]: 'Pick the folder that contains the DDF dataset. More info can be found under DDFcsv format description here: https://open-numbers.github.io/ddf.html',
  [INCORRECT_FILE]: 'Check that files do not contain unprintable characters (spaces, tabs etc) or exists. The safe bet is when your filenames only contain english alphanumeric characters, underscores, hyphens and a dot before extension',
  [INCORRECT_JSON_FIELD]: 'A value is suspected to be a JSON but can not be successfully parsed as such. For example, "Congo [DRC]" should rather look like "Congo, DRC"',
  [CONCEPT_ID_IS_NOT_UNIQUE]: 'Check ddf--concepts.csv file. The values in column "concept" should never repeat.',
  [INCORRECT_CONCEPT_TYPE]: 'In column "concept_type" only the following options are allowed: boolean, string, measure, entity_domain, entity_set, time, year, week, month, day, quarter, interval, role, custom_type. See the docs about DDF conceptual model for more info https://open-numbers.github.io/ddf.html',
  [EMPTY_CONCEPT_ID]: 'Check ddf--concepts.csv file. Concept ID should never be empty.',
  [EMPTY_ENTITY_ID]: 'Check ddf--entities-xxx.csv file. Entity ID should never be empty.',
  [INCORRECT_IDENTIFIER]: 'Entity and concept identifiers can only contain lowercase alphanumeric english characters and underscores.',
  [NON_CONCEPT_HEADER]: 'Each part of any header should be a concept in ddf--concepts.csv file ("is--" field is an exception).',
  [INVALID_DRILL_UP]: 'Check ddf--concepts.csv file, column "drill_up". The value should be an array of existing concepts like "[""concept1"",""concept2""]"',
  [MEASURE_VALUE_NOT_NUMERIC]: 'Check that every column of concept_type measure contains only numeric values.',
  [DATA_POINT_UNEXPECTED_ENTITY_VALUE]: 'Check that the entity ID listed in details is present in the entity file and is spelled correctly.',
  [DATA_POINT_UNEXPECTED_TIME_VALUE]: 'Check that time values are consistently following one of these patterns: 2017, 2017q1, 2017w03, 20170328, 201703. For more info see DDF conceptual model: https://open-numbers.github.io/ddf.html',
  [WRONG_DATA_POINT_HEADER]: 'Only concepts of types "time", "entity_domain" and "entity_set" are allowed to be used as keys in datapoints files. The header should be correctly reflected in datapackage.json (see how you can rebuild datapackage here: https://github.com/Gapminder/ddf-validation#datapackage)',
  [SAME_KEY_VALUE_CONCEPT]: 'If a concept is already included in key it should not appear as value in schemas of datapackage.json. You can fix it manually or regenerate datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage',
  [WRONG_ENTITY_IS_HEADER]: 'Edit the header to reference one of the entity sets. For example a correct header can be "is--country", where "country" is a concept of type "entity_set". More info in DDF conceptual model: https://open-numbers.github.io/ddf.html',
  [WRONG_ENTITY_IS_VALUE]: 'Replace values in "is"-column with booleans. Safe to use them in capitals, like TRUE and FALSE. More info in DDF conceptual model: https://open-numbers.github.io/ddf.html',
  [NON_UNIQUE_ENTITY_VALUE]: 'Entity IDs in one entity domain and all sets in that domain should be unique. Like you can not have two country IDs "korea". But you can have country ID "male" and gender ID "male" since they are in different entity domains. More info in DDF conceptual model: https://open-numbers.github.io/ddf.html',
  [CONCEPT_MANDATORY_FIELD_NOT_FOUND]: 'Check ddf--concepts.csv file. For all concepts "concept_type" should be defined. For entity sets "domain" is mandatory and should reference an "entity_domain". For roles "domain" is mandatory and should reference an "entity_set" or an "entity_domain". More info in DDF conceptual model: https://open-numbers.github.io/ddf.html',
  [CONCEPTS_NOT_FOUND]: 'Check ddf--concepts.csv file. It should exist and contain a list with values defined ar least in columns "concept" and "concept_type". More info in DDF conceptual model: https://open-numbers.github.io/ddf.html',
  [DATAPACKAGE_INCORRECT_FIELDS]: 'Regenerate or update datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage',
  [DATAPACKAGE_NON_CONCEPT_FIELD]: 'Regenerate or update datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage',
  [DATAPACKAGE_INCORRECT_PRIMARY_KEY]: 'Regenerate or update datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage',
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: 'Regenerate or update datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage',
  [DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: 'Regenerate or update datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage',
  [DATAPACKAGE_NONEXISTENT_RESOURCE]: 'Resource found in datapackage that is not present in folder',
  [DATAPACKAGE_NONEXISTENT_CONCEPT]: 'Concept found in datapackage but is not listed in concepts table',
  [INCONSISTENT_DATAPACKAGE]: 'Fix datapackage.json format in accordance with "Data Package" requirements (https://frictionlessdata.io/specs/data-package/) or add mandatory sections (ddfSchema).',
  [UNEXPECTED_TRANSLATION_HEADER]: 'Remove the resource from datapackage or restore it in the folder',
  [UNEXPECTED_TRANSLATIONS_DATA]: 'Remove the resource from datapackage or add it to the concepts table',
  [UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: '',
  [DUPLICATED_DATA_POINT_TRANSLATION_KEY]: '',
  [DUPLICATED_TRANSLATION_KEY]: '',
  [DATA_POINT_WITHOUT_INDICATOR]: 'Datapoint files without indicator make no sense and you should remove them. Then regenerate or update datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage',
  [UNEXISTING_CONSTRAINT_VALUE]: 'If entity IDs are enumerated in datapoint filenames, check that they are present in the respective entity tables. Enumerated entity constraints in datapackage.json should then match. Regenerate or update datapackage as described here: https://github.com/Gapminder/ddf-validation#datapackage. More info on DDFcsv file naming: https://open-numbers.github.io/ddf.html',
  [DATA_POINT_CONSTRAINT_VIOLATION]: 'Some datapoints do not conform the entity constraints imposed in their filenames and/or in datapackage.json. More info on DDFcsv file naming: https://open-numbers.github.io/ddf.html',
  [DUPLICATED_DATA_POINT_KEY]: 'Datapoint files should have unique keys',
  [INCORRECT_BOOLEAN_ENTITY]: 'Use only TRUE or FALSE values for concepts of type "boolean"',
  [CONCEPT_LOOKS_LIKE_BOOLEAN]: 'Consider changing the concept type to "boolean"',
  [ENTITY_VALUE_AS_ENTITY_NAME]: 'Simplest way to fix the issue is entity value renaming, in other case domain or entity set name should be changed.',
  [DUPLICATED_SYNONYM_KEY]: 'Remove duplicated key or change it properly',
  [INCONSISTENT_SYNONYM_KEY]: 'Correct key as (entity and synonym should be defined) in a related ddf--synonyms--xxx.csv file'
};

export const getRulesInformation = () => Object.getOwnPropertySymbols(exports.descriptions)
  .reduce((result, issueType) =>
    `${result}${Symbol.keyFor(issueType)} -> ${exports.descriptions[issueType]}
      tags: ${tagsToString(exports.tags[issueType])}\n\n`, 'Supported rules are:\n\n');
