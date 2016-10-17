#  UNEXPECTED_DATA

## Rule test folders 

`test/fixtures/rules-cases/unexpected-data/indexed`
`test/fixtures/rules-cases/unexpected-data/indexless`

##  Description

An issue according to this rule will be fired when filename and header are good but content isn't: content 

## Examples of correct data

```
ddf--concepts.csv

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

```
ddf--concepts.csv

concept,concept_type,domain,name
foo
geo,entity_domain,,
```
