This app checks the validity of [DDF datasets](https://open-numbers.github.io/ddf.html) and generates datapackage

You can use this app in 3 ways: through a GUI of Gapminder Offline, as a command line tool or through the API

## Normal people can use validator in Gapminder Offline app (version 3.3.0+)

* Download and install [Gapminder Offline](https://gapminder.org/tools-offline)   
* Go to the top-right menu and chose "DDF tools". Follow instructions on the screen for the rest of the process. 

#### datapackage
* With Gapminder Offline DDF tools you can also create or update datapackage file if you chose an option to do so.

## Advanced users can use validator as a command line tool

* System requiremet: you have [node.js](https://nodejs.org/) environment installed on your computer  
* Open your terminal and install validator globally: in any folder run `npm install ddf-validation -g`
* Navigate to the folder where the DDF dataset you want to validate is located  
* Run validation: `validate-ddf`, look for the terminal output, which may come in a while depending on the size of dataset  
* If issues are found, the validator will create a human-readable text file with the timestamp, which you can read and debug your dataset

#### datapackage
* Generating a new datapackage json: run validator with -i flag: `validate-ddf -i`
* Updating existing datapackage json and preserving your headers: run validator with --content flag: `validate-ddf --content`

There is a ton of possible options you can use to customise the validation, make it faster, etc, see the complete reference [here](doc/user-guide.md)

## Programmers can use validator via the API

See the [API reference](doc/api-reference.md), also [datapackage generation via APi](doc/api-reference.md#datapackagejson-creation)

## Gods can improve the validator

See the [developer's guide](doc/developer-guide.md), also see [testing](doc/developer-guide.md#testing) and [release routines](doc/developer-guide.md#release-routines)



