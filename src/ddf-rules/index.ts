import * as registry from './registry';

import { rule as conceptIdIsNotUnique } from './concept-rules/concept-id-is-not-unique';
import { rule as emptyConceptId } from './concept-rules/empty-concept-id';
import { rule as incorrectConceptType } from './concept-rules/incorrect-concept-type';
import { rule as nonConceptHeader } from './concept-rules/non-concept-header';
import { rule as conceptMandatoryFieldNotFound } from './concept-rules/concept-mandatory-field-not-found';
import { rule as conceptsNotFound } from './concept-rules/concepts-not-found';
import { rule as invalidDrillUp } from './concept-rules/invalid-drill-up';

import { rule as incorrectFile } from './data-package-rules/incorrect-file';
import { rule as incorrectFields } from './data-package-rules/incorrect-fields';
import { rule as nonConceptField } from './data-package-rules/non-concept-field';
import { rule as incorrectPrimaryKey } from './data-package-rules/incorrect-primary-key';
import { rule as nonUniqueResourceName } from './data-package-rules/non-unique-resource-name';
import { rule as nonUniqueResourceFile } from './data-package-rules/non-unique-resource-file';
import { rule as dataPointWithoutIndicator } from './data-package-rules/datapoint-without-indicator';
import { rule as sameKeyValueConcept } from './data-package-rules/same-key-value-concept';

// import { rule as measureValueNotNumeric } from './data-point-rules/measure-value-not-numeric';
import { rule as unexpectedEntityValue } from './data-point-rules/unexpected-entity-value';
import { rule as unexpectedTimeValue } from './data-point-rules/unexpected-time-value';
import { rule as dataPointConstraintViolation } from './data-point-rules/constraint-violation';
import { rule as duplicatedDataPointKey } from './data-point-rules/duplicated-data-point-key';

import { rule as nonUniqueEntityValue } from './entity-rules/non-unique-entity-value';
import { rule as wrongEntityIsHeader } from './entity-rules/wrong-entity-is-header';
import { rule as wrongEntityIsValue } from './entity-rules/wrong-entity-is-value';
import { rule as unexistingConstraintValueRule } from './entity-rules/unexisting-constraint-value';

import { rule as emptyData } from './general-rules/empty-data';
import { rule as unexpectedData } from './general-rules/unexpected-data';
import { rule as wrongDataPointHeader } from './general-rules/wrong-data-point-header';
import { rule as incorrectIdentifier } from './general-rules/incorrect-identifier';
import { rule as incorrectJsonField } from './general-rules/incorrect-json-field';
import { rule as nonDdfDataset } from './general-rules/non-ddf-dataset';

import { rule as unexpectedTranslationHeader } from './translation-rules/unexpected-translation-header';
import { rule as unexpectedTranslationsData } from './translation-rules/unexpected-translations-data';
import { rule as unexpectedDataPointTranslationsData } from './translation-rules/unexpected-data-point-translations-data';
import { rule as duplicatedDataPointTranslationKey } from './translation-rules/duplicated-data-point-translation-key';
import { rule as duplicatedTranslationKey } from './translation-rules/duplicated-translation-key';

export const allRules = {
  [registry.CONCEPT_ID_IS_NOT_UNIQUE]: conceptIdIsNotUnique,
  [registry.EMPTY_CONCEPT_ID]: emptyConceptId,
  [registry.INCORRECT_CONCEPT_TYPE]: incorrectConceptType,
  [registry.NON_CONCEPT_HEADER]: nonConceptHeader,
  [registry.CONCEPT_MANDATORY_FIELD_NOT_FOUND]: conceptMandatoryFieldNotFound,
  [registry.CONCEPTS_NOT_FOUND]: conceptsNotFound,
  [registry.INVALID_DRILL_UP]: invalidDrillUp,
  [registry.INCORRECT_FILE]: incorrectFile,
  [registry.DATAPACKAGE_INCORRECT_FIELDS]: incorrectFields,
  [registry.DATAPACKAGE_NON_CONCEPT_FIELD]: nonConceptField,
  [registry.DATAPACKAGE_INCORRECT_PRIMARY_KEY]: incorrectPrimaryKey,
  [registry.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME]: nonUniqueResourceName,
  [registry.DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE]: nonUniqueResourceFile,
  [registry.DATA_POINT_WITHOUT_INDICATOR]: dataPointWithoutIndicator,
  // [registry.MEASURE_VALUE_NOT_NUMERIC]: measureValueNotNumeric,
  [registry.DATA_POINT_UNEXPECTED_ENTITY_VALUE]: unexpectedEntityValue,
  [registry.DATA_POINT_UNEXPECTED_TIME_VALUE]: unexpectedTimeValue,
  [registry.SAME_KEY_VALUE_CONCEPT]: sameKeyValueConcept,
  [registry.WRONG_ENTITY_IS_HEADER]: wrongEntityIsHeader,
  [registry.WRONG_ENTITY_IS_VALUE]: wrongEntityIsValue,
  [registry.NON_UNIQUE_ENTITY_VALUE]: nonUniqueEntityValue,
  [registry.EMPTY_DATA]: emptyData,
  [registry.UNEXPECTED_DATA]: unexpectedData,
  [registry.NON_DDF_DATA_SET]: nonDdfDataset,
  [registry.WRONG_DATA_POINT_HEADER]: wrongDataPointHeader,
  [registry.INCORRECT_IDENTIFIER]: incorrectIdentifier,
  [registry.INCORRECT_JSON_FIELD]: incorrectJsonField,
  [registry.UNEXPECTED_TRANSLATION_HEADER]: unexpectedTranslationHeader,
  [registry.UNEXPECTED_TRANSLATIONS_DATA]: unexpectedTranslationsData,
  [registry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]: unexpectedDataPointTranslationsData,
  [registry.DUPLICATED_DATA_POINT_TRANSLATION_KEY]: duplicatedDataPointTranslationKey,
  [registry.DUPLICATED_TRANSLATION_KEY]: duplicatedTranslationKey,
  [registry.UNEXISTING_CONSTRAINT_VALUE]: unexistingConstraintValueRule,
  [registry.DATA_POINT_CONSTRAINT_VIOLATION]: dataPointConstraintViolation,
  [registry.DUPLICATED_DATA_POINT_KEY]: duplicatedDataPointKey
};
