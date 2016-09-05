#  NON_UNIQUE_ENTITY_VALUE

## Rule test folder 

`test/fixtures/rules-cases/non-unique-entity-value`

## Description
An issue according to this rule will be fired when id value entity (under particular kind of entity, geo-country, for example) is not unique.

## Examples of correct data

`ddf--entities--geo--income_groups.csv`
```
income_groups,name,gwid,is--income_groups
high_income,High income,i268,TRUE
lower_middle_income,Lower middle income,i269,TRUE
low_income,Low income,i266,TRUE
upper_middle_income,Upper middle income,i267,TRUE
```

## Examples of incorrect data

`ddf--entities--geo--income_groups.csv`
```
income_groups,name,gwid,is--income_groups
high_income,High income,i268,TRUE
high_income,High income,i268,TRUE
lower_middle_income,Lower middle income,i269,TRUE
low_income,Low income,i266,TRUE
upper_middle_income,Upper middle income,i267,TRUE
```

## Output data format

* `value` - duplicated entity id value

## Extra information

### @jheeffer

ddf--entities--geo--country.csv
```
geo  name    is--country
swe  Sweden  1
```

ddf--entities--geo--un_state.csv
```
geo  name    un_membership_year  is--un_state
swe  Sweden  1946                1
```

The above is valid but should give a warning because `geo.name` of `swe` is defined twice, but is equal so there's no error.
I am not sure about the warning here. On the one hand, it is good to try to limit the amount of redundant data in a dataset. Warnings could help with spotting these redundancies.
On the other hand, this could lead to maaaaany useless warnings. Maybe they should be per file: "`geo.name` is defined in both `ddf--entities--geo--country.csv` and `ddf--entities--geo--un_state.csv` and causes redundancy" instead of a per-entity warning. However, this is a more complex validation I think. It's possible for `geo.name` to be in multiple files without causing overlap/redundancy. Plus, duplicating `geo.name` over files could be useful for overview, so maybe a warning is not always in place? What do you think?

---------------

ddf--entities--geo--country.csv
```
geo  name    is--country
swe  Sweden  1
```

ddf--entities--geo--un_state.csv
```
geo  name               un_membership_year  is--un_state
swe  Kingdom of Sweden  1946                1
```

The above is invalid and should throw an error because `geo.name` for `swe` has two different values and thus there's a conflict for the value of `geo.name` for `swe`.

### @jheeffer

Also I'm fine with error'ing on duplicate ID in one file, as under your first case.

ddf--entities--geo--country.csv
```
geo  name     is--country
swe  Sweden   1
ukr  Ukraine  1
swe  Sweden   1
```
Invalid because of duplicate `swe` entity in one file, even though properties are all the same.

### @buchslava

 yes I understand this idea: I'll get keys intersection for two records, for example,

for `name  is--country` and `name un_membership_year  is--un_state` intersection will be `name`

and after I'll analyze values for those fields (`name`). if they are equal - ok, else - error
