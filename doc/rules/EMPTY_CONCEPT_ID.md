#  EMPTY_CONCEPT_ID

## Rule test folder 

`test/fixtures/rules-cases/empty-concept-id`

## Description

An issue according to this rule will be fired when concept ID (`concept` header) is empty

## Examples of correct data

`ddf--concepts.csv`
```
concept,concept_type,domain,name,drill_up
name,string,,
geo,entity_domain,,
```

## Examples of incorrect data

`ddf--concepts.csv`
```
concept,concept_type,domain,name,drill_up
name,string,,
,entity_domain,,
```

## Output data format

CSV line number of record with empty concept ID
