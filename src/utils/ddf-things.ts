import { startsWith } from 'lodash';

export const isDdfTrue = value => value === 'TRUE' || value === 'true';
export const isDdfFalse = value => value === 'FALSE' || value === 'false';
export const isDdfBoolean = value => isDdfTrue(value) || isDdfFalse(value);
export const fieldIsPrefix = 'is--';
export const looksLikeIsField = field => startsWith(field, fieldIsPrefix);

export const CONCEPT_TYPE_BOOLEAN = 'boolean';
export const CONCEPT_TYPE_STRING = 'string';
export const CONCEPT_TYPE_MEASURE = 'measure';
export const CONCEPT_TYPE_ENTITY_DOMAIN = 'entity_domain';
export const CONCEPT_TYPE_ENTITY_SET = 'entity_set';
export const CONCEPT_TYPE_TIME = 'time';
export const CONCEPT_TYPE_YEAR = 'year';
export const CONCEPT_TYPE_WEEK = 'week';
export const CONCEPT_TYPE_MONTH = 'month';
export const CONCEPT_TYPE_DAY = 'day';
export const CONCEPT_TYPE_QUARTER = 'quarter';
export const CONCEPT_TYPE_INTERVAL = 'interval';
export const CONCEPT_TYPE_ROLE = 'role';
export const CONCEPT_TYPE_CUSTOM_TYPE = 'custom_type';

export const CONCEPT_TYPES = [
  CONCEPT_TYPE_BOOLEAN,
  CONCEPT_TYPE_STRING,
  CONCEPT_TYPE_MEASURE,
  CONCEPT_TYPE_ENTITY_DOMAIN,
  CONCEPT_TYPE_ENTITY_SET,
  CONCEPT_TYPE_TIME,
  CONCEPT_TYPE_YEAR,
  CONCEPT_TYPE_WEEK,
  CONCEPT_TYPE_MONTH,
  CONCEPT_TYPE_DAY,
  CONCEPT_TYPE_QUARTER,
  CONCEPT_TYPE_INTERVAL,
  CONCEPT_TYPE_ROLE,
  CONCEPT_TYPE_CUSTOM_TYPE
];
