# `EMPTY_DATA`

## Rule test folder 

`test/fixtures/rules-cases/empty-data`

## Description

An issue according to this rule will be fired when file with true name and header does not contain any data under the header.

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
```

* **Output data format** Additional data that depends on particular issue type. Should be filled if type of Request is `rule`.

filename

## Detailed Description

This issue has warning type
