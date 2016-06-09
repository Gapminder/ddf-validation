# CONCEPT_MANDATORY_FIELD_NOT_FOUND

## Rule test folder 

`test/fixtures/rules-cases/concept-mandatory-field-not-found`

## Description

Mandatory fields for ALL concepts are not defined

## Examples of correct data

`ddf--concepts.csv`
```
concept,concept_type,domain,name
name,string,,
geo,entity_domain,,
region,entity_set,geo,Region
country,entity_set,geo,Country
capital,entity_set,geo,Capital
pop,measure,geo,Population
year,time,,year
```

## Examples of incorrect data

`ddf--concepts.csv`
```
concept,concept_type,domain,name
name,,,
geo,entity_domain,,
region,entity_set,name,Region
country,entity_set,,Country
capital,entity_set,geo,Capital
pop,measure,geo,Population
year,time,,year
```

## Output data format

Should be included next information:

missing or wrong header values

## Detailed Description

Expected mandatory header value: `concept_type`

### Also

However, for entity sets and roles a domain is mandatory.
So a concept which has `concept_type` `entity_set` or `role`, the concept property `domain` is mandatory. For `entity_set`, `domain` should be an `entity_domain` defined elsewhere in the dataset. For `role`, `domain` should be an `entity_set` or `entity_domain` defined elsewhere in the dataset.
For `measure`, `domain` is optional.
