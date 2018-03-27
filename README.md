# DDF validation

This nodejs app checks the validity of a DDF datasets and generates datapackage

You can use this app in 3 ways: through a GUI of Gapminder Offline, as a command line tool, through an API using an [npm package](https://www.npmjs.com/package/ddf-validation)

## How to use the validator in Gapminder Offline app

Download and install [Gapminder Offline](https://gapminder.org/tools-offline)  
Go to the top-right menu and chose "DDF tools". Follow instructions on the screen for the rest of the process. With Gapminder Offline DDF tools you can also create or update datapackage file if you chose an option to do so.

## How to use the validator as a command line tool

System requiremet: you have [node.js](https://nodejs.org/) environment installed on your computer  
Open your terminal and install validator globally: in any folder run `npm install ddf-validation -g`
Navigate to the folder where the DDF dataset is located  
Run validation: `validate-ddf`, look for the terminal output, which may come in a while depending on the size of dataset  
If issues are found, the validator will create a text file with the timestamp, which you can read and debug your dataset

Generating datapackage json: run validator with -i flag: `validate-ddf -i`

There are a ton of possible options you can use to customise the validation, see the complete user's guide [here](doc/user-guide.md)

## API usage

See [API reference](doc/api-reference.md), also [datapackage generation](doc/api-reference.md#datapackagejson-creation)

# Developer guide

See [developer's guide](doc/developer-guide.md), also see [testing](doc/developer-guide.md#testing) and [release routines](doc/developer-guide.md#release-routines)



