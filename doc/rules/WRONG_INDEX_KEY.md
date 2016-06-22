# WRONG_INDEX_KEY

## Rule test folder 

`test/fixtures/rules-cases/wrong-index-key`

## Description
An issue according to this rule will be fired when `key` in `ddf--index.csv` is not valid. The key should be concept or set of concepts or `concept` constant.

## Examples of correct data

`ddf--index.csv`
```
key,value,file
concept,concept_type,ddf--concepts.csv
concept,name,ddf--concepts.csv
"geo,year",gas_production_bcf,ddf--datapoints--gas_production_bcf--by--geo--year.csv
geo,geo_name,ddf--entities--geo.csv
```

`ddf--concepts.csv`
```
concept,concept_type,name
geo,entity_domain,Geo
gas_production_bcf,measure,Gas Production – Bcf
name,string,Name
year,time,Year
```

## Examples of incorrect data

`ddf--index.csv`
```
key,value,file
concept,concept_type,ddf--concepts.csv
concept,name,ddf--concepts.csv
"geo,foo",gas_production_bcf,ddf--datapoints--gas_production_bcf--by--geo--year.csv
bar,geo_name,ddf--entities--geo.csv
```

`ddf--concepts.csv`
```
concept,concept_type,name
geo,entity_domain,Geo
gas_production_bcf,measure,Gas Production – Bcf
name,string,Name
year,time,Year
```

## Output data format

Non existing concepts that found in record's key of DDF index
