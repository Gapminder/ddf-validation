# WRONG_DATA_POINT_HEADER

## Rule test folder 

`test/fixtures/rules-cases/wrong-data-point-header`

## Description
Raised when header contains a concept based on `string` type 

## Examples of correct data

ddf--concepts.csv
```
concept,concept_type,domain,name
domain,string,,Domain
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
domain,string,,Domain
name,string,,
geo,entity_domain,,
country,entity_set,geo,Country
pop,measure,geo,Population
year,time,,year
```

ddf--datapoints--pop--by--country--year.csv
```
country,year,pop,name
vat,1960,100000,foo
```

## Output data format

Should be included next information:

incorrect header value
