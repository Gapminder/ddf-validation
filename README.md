# ddf-validation

Here is a console application for [DDF](https://github.com/open-numbers/Data-Description-Format-DDF/wiki) data validation.
 
## Quick start

- A recommended way to install ***ddf-validation*** is through [npm](https://www.npmjs.com/search?q=ddf-validation) package manager using the following command:

`npm i -g ddf-validation@latest`

Also you can find this solution in [GIT repository](https://github.com/valor-software/ddf-validation.git).

- Run this application:

`validate-ddf <root folder>`

- More information you can see after `validate-ddf` running

## Some optional settings

### -d Dimension for gaps checking in data points

`validate-ddf some-ddf-folder -d year` or

`validate-ddf some-ddf-folder -d year -d other_dimension`

In this mode application will generate warnings about gaps in DDF set of data.
For example, geo=abkh and year=1983

### -c Console (non UI) output

`validate-ddf some-ddf-folder -c`
