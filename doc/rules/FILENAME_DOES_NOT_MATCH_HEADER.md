# FILENAME_DOES_NOT_MATCH_HEADER

## Rule test folder 

`test/fixtures/rules-cases/filename-does-not-match-header`

## Description

An issue according to this rule will be fired when headers (first line of csv) does not match to name of file. You can get more details here: https://docs.google.com/document/d/1aynARjsrSgOKsO1dEqboTqANRD1O9u7J_xmxy8m5jW8/edit#heading=h.1nakjy92hz6r

## Examples of correct data

`ddf--entities--geo--country.csv` should include `geo` and `country` or `is--country`  in own header
`ddf--datapoints--sg_ini--by--geo--time.csv` should include `geo, time, sg_ini` in own header

## Examples of incorrect data

`ddf--entities--geo--country.csv` contains `geo` without `country` or `is--country`
`ddf--datapoints--sg_ini--by--geo--time.csv` contains `geo, time`
`ddf--datapoints--sg_ini--by--geo--time.csv` contains `foo`

## Output data format

wrong header

## Detailed Description

This rule should be implemented only for `entities` and `datapoints`
