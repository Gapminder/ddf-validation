#  WRONG_ENTITY_IS_VALUE`

## Rule test folder 

`test/fixtures/rules-cases/wrong-entity-is-value`

## Description
An issue according to this rule will be fired when value under `is-` header doesn't look like boolean

## Examples of correct data

`ddf--entities--geo--income_groups.csv`
```
income_groups,name,gwid,is--income_groups
high_income,High income,i268,TRUE
lower_middle_income,Lower middle income,i269,TRUE
low_income,Low income,i266,TRUE
upper_middle_income,Upper middle income,i267,TRUE
```

## Examples of incorrect data

`ddf--entities--geo--income_groups.csv`
```
income_groups,name,gwid,is--income_groups
high_income,High income,i268,FOO
```

## Output data format

* `header name`  - csv's column name
* `header value` 
* `line in csv`
