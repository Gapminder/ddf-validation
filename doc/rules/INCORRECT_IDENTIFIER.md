# INCORRECT_IDENTIFIER

## Rule test folder 

`test/fixtures/rules-cases/incorrect-identifier`

## Description

Entity identifiers and concept identifiers can only contain lowercase alphanumeric characters and underscores.

## Examples of correct data

`ddf--concepts.csv`
```
concept,concept_type,domain,name,drill_up
name,string,,,
geo,entity_domain,,,
domain,string,,Domain,
country,entity_set,geo,Country,
capital,entity_set,geo,Capital,
year,time,,year,
```

`ddf--entities--geo--country.csv`
```
geo,name,lat,lng,is--region,is--country,is--capital
and,Andorra,,,0,1,0
afg,Afghanistan,,,0,1,0
```
* **Examples of incorrect data:**

`ddf--concepts.csv`
```
concept,concept_type,domain,name,drill_up
name,string,,,
geo,entity_domain,,,
dom*ain,string,,Domain,
Country,entity_set,geo,Country,
capital,entity_set,geo,Capital,
year-%,time,,year,
```

`ddf--entities--geo--country.csv`
```
geo,name,lat,lng,is--region,is--country,is--capital
An-d,Andorra,,,0,1,0
$&*,Afghanistan,,,0,1,0
```

* **Scenarios** Should be filled if type of Request is `rule`.

```
when dataset is correct
  any issue should NOT be found for this rule
```

```
when dataset is NOT correct
  issues in accordance with wrong datapoint records quantity should be detected for this rule
  output data for any issue should be expected
```

## Output data format

wrong identifier value
