# WRONG_ENTITY_IS_HEADER

## Rule test folder 

`test/fixtures/rules-cases/wrong-entity-is-header`

## Description
An issue according to this rule will be fired when `is-header` in concept is defined and not valid: not a concept with `entity_set` type

## Examples of correct data

`ddf--concepts.csv`
```
"concept","name","concept_type","domain",
"income_groups","Income groups","entity_set","geo",
"geo","Geographic location","entity_domain",,
```
and
`ddf--entities--geo--income_groups.csv`
```
income_groups,name,gwid,is--income_groups
high_income,High income,i268,TRUE
lower_middle_income,Lower middle income,i269,TRUE
low_income,Low income,i266,TRUE
upper_middle_income,Upper middle income,i267,TRUE
```

## Examples of incorrect data

`ddf--concepts.csv`
```
"concept","name","concept_type","domain",
"income_groups","Income groups","entity_set","geo",
"geo","Geographic location","entity_domain",,
```
and
`ddf--entities--geo--income_groups.csv`
```
income_groups,name,gwid,is--foo_groups
high_income,High income,i268,TRUE
lower_middle_income,Lower middle income,i269,TRUE
low_income,Low income,i266,TRUE
upper_middle_income,Upper middle income,i267,TRUE
```

## Output data format

* `message` - kind of issue. It should be `Not a concept` or `Wrong concept type`
* `header name` - csv's column name 

### Additional information

is--header is not mandatory anywhere, absence just means all entities have value false for that is--header.

only error when: `is--xxx` is used when `xxx` is not defined in concepts as an entity_set. No other case should give an error.

So the following is also valid (though the `is--country` is nonsensical):
`ddf--concepts.csv`
```
"concept","name","concept_type","domain",
"income_groups","Income groups","entity_set","geo",
"geo","Geographic location","entity_domain",,
"country","Country","entity_set","geo"
```
`incomegroups.csv`
```
income_groups,name,gwid,is--income_groups,is--country
high_income,High income,i268,TRUE,FALSE
lower_middle_income,Lower middle income,i269,TRUE,FALSE
low_income,Low income,i266,TRUE,TRUE
upper_middle_income,Upper middle income,i267,TRUE,TRUE
```
`ddf--index.csv`
```
"key","value","file"
"income_groups","name","incomegroups.csv"
"income_groups","gwid","incomegroups.csv"
```
