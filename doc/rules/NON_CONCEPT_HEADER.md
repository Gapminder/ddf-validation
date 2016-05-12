# NON_CONCEPT_HEADER

## Rule test folder 

`test/fixtures/rules-cases/non-concept-header`

## Description
Each part of any header should be concept (is-- fields are excluded in this case)

## Examples of correct data

ddf--concepts.csv
```
concept,concept_type,domain,name
name,string,,
geo,entity_domain,,
country,entity_set,geo,Country
pop,measure,geo,Population
year,time,,year
```

ddf--datapoints--pop--by--country--year.csv
```
country,year,pop
vat,1960,100000
```

## Examples of incorrect data

ddf--concepts.csv
```
concept,concept_type,domain,name
name,string,,
geo,entity_domain,,
country,entity_set,geo,Country
pop,measure,geo,Population
year,time,,year
```

ddf--datapoints--pop--by--country--year.csv
```
countryFOO,year,pop
vat,1960,100000
```

## Output data format

Should be included next information:

incorrect header value
