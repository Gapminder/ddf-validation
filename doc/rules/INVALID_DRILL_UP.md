# INVALID_DRILL_UP

## Rule test folder 

`test/fixtures/rules-cases/invalid-drill_up`

## Description
An issue according to this rule will be fired when drill up in concept is defined and not valid: not a set of valid concepts

## Examples of correct data

ddf--concepts.csv
```
concept,concept_type,domain,name,drill_up
name,string,,,
drill_up,string,,,
geo,entity_domain,,,
domain,string,,Domain,
region,entity_set,geo,Region,"[""country"",""capital""]"
country,entity_set,geo,Country,
capital,entity_set,geo,Capital,
pop,measure,geo,Population,
year,time,,year,
```

## Examples of incorrect data

ddf--concepts.csv
```
concept,concept_type,domain,name,drill_up
name,string,,,
drill_up,string,,,
geo,entity_domain,,,
geo2,entity_domain,,,
domain,string,,Domain,
region,entity_set,geo,Region,"[""country"",""capital2"",""foo"", ""name""]"
country,entity_set,geo,Country,"['country','capital']"
capital,entity_set,geo,Capital,
capital2,entity_set,geo2,Capital,
pop,measure,geo,Population,
year,time,,year,
```

## Output data format

drill up name
drill up domain
reasons

reasons should be next:

 * wrong entity domain for drill up
 * concept for drill up is not found
 * wrong entity domain for current drill up

### Entity set in particular drill up should be related to its entity set.