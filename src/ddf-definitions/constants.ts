import { head, includes, isArray } from 'lodash';

export const getArrayInAnyCase = (value) => !isArray(value) ? [value] : value;

export const CONCEPT = Symbol.for('concepts');
export const ENTITY = Symbol.for('entities');
export const DATA_POINT = Symbol.for('datapoints');
export const SYNONYM = Symbol.for('synonyms');

export const LINE_NUM_INCLUDING_HEADER = 2;

export const DDF_SEPARATOR = '--';
export const DDF_DATAPOINT_SEPARATOR = 'by';
export const CONCEPT_ID = 'concept';
export const CONCEPT_TYPE = 'concept_type';
export const SYNONYM_ID = 'synonym';
export const DOMAIN_ID = 'domain';
export const PREDEFINED_CONCEPTS = [exports.CONCEPT_ID, exports.CONCEPT_TYPE];
export const TRANSLATIONS_FOLDER = 'lang';

export const getTypeByPrimaryKey = (primaryKeyParam: string[]) => {
  const primaryKey = getArrayInAnyCase(primaryKeyParam);

  if (primaryKey.length === 1 && head(primaryKey) === CONCEPT_ID) {
    return CONCEPT;
  }

  if (primaryKey.length !== 1 && includes(primaryKey, CONCEPT_ID) && !includes(primaryKey, SYNONYM_ID)) {
    return null;
  }

  if (primaryKey.length === 1 && head(primaryKey) !== CONCEPT_ID) {
    return ENTITY;
  }

  if (primaryKey.length < 2 && includes(primaryKey, SYNONYM_ID)) {
    return null;
  }

  if (primaryKey.length >= 2 && includes(primaryKey, SYNONYM_ID)) {
    return SYNONYM
  }

  if (primaryKey.length > 1) {
    return DATA_POINT;
  }

  return null;
};

export const getDecoratedDataPackageObject = (dataPackageObject) => ({
  getDataPackageObject: () => dataPackageObject,
  getAllResources: () => dataPackageObject.resources
});
