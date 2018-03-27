First of all you should install this package: `npm i ddf-validation`

`ddf-validation` can be used via an API in three different ways:

 * JSON based validator (`JSONValidator`)
 * Stream based validator (`StreamValidator`)
 * Validator that checks whether dataset has errors and if there are some - returns `true`, otherwise - `false`

Some examples of API using:

### JSONValidator

Simple example

```
const api = require('ddf-validation');
const JSONValidator = api.JSONValidator;
const jsonValidator = new JSONValidator('path to ddf dataset');

jsonValidator.on('finish', (err, jsonIssuesContent) => {
  console.log(err, jsonIssuesContent);
});

api.validate(jsonValidator);
```

This validator's type returns all issues as JSON object.
And for this reason it's not suitable for huge DDF datasets.

### StreamValidator

```
const api = require('ddf-validation');
const StreamValidator = api.StreamValidator;
const streamValidator = new StreamValidator('path to ddf dataset', custom parameters);
// custom parameters should be explained a little bit later

streamValidator.on('issue', issue => {
  // catch new issue here
});

streamValidator.on('finish', err => {
  // validation is finished
});

api.validate(streamValidator);
```

StreamValidator returns each issue separately one by one.
It is good choice for huge DDF datasets.
`StreamValidator` is the default validator.

### SimpleValidator

According to the state of the dataset (valid or not) this validator returns only true or false with appropriate meaning.
This is the fastest validator among given here.

```
const api = require('ddf-validation');
const SimpleValidator = api.SimpleValidator;
const simpleValidator = new SimpleValidator('./test/fixtures/good-folder-indexed', custom parameters);
// custom parameters should be explained a little bit later

simpleValidator.on('finish', (err, isDataSetCorrect) => {
  // isDataSetCorrect === true if DDF dataset is correct
  // isDataSetCorrect === true if DDF dataset is incorrect
});

api.validate(simpleValidator);
```

### Custom parameters

Also all validators supports validation parameters that corresponds with some parameters from command line:

|     parameter     |    corresponds ...    |         JS type         |                    description                      |
|-------------------|-----------------------|-------------------------|-----------------------------------------------------|
| excludeDirs       | `exclude-dirs`        | array of strings(see 1) | list of folders should be ignored during validation |
| includeTags       | `include-tags`        | string(see notes 2, 3)  | use only tags that specified in the list            |
| excludeTags       | `exclude-tags`        | string(see notes 2, 3)  | exclude tags that specified in the list             |
| includeRules      | `include-rules`       | string(see notes 2, 3)  | use only rules that specified in the list           |
| excludeRules      | `exclude-rules`       | string(see notes 2, 3)  | exclude rules that specified in the list            |
| datapointlessMode | `datapointless`       | boolean                 | don't validate datapoints                           |
| isCheckHidden     | `hidden`              | boolean                 | allow to validate hidden (starts with '.') folders  |
| isMultithread     | `multithread` (see 4) | boolean                 | validate datapoints in separate threads             |
| useAllCpu         | `use-all-cpu `        | boolean                 | use all CPU during validation via multithread mode  |

Notes.

1. Apart from `array of string` you can use a string that contains expected folders split by ','.
   If those folders contain spaces you can surround them by " or ' character.
2. Separate tags or rules should be split by space character
3. Full list of tags and rules you can see via `validate-ddf --rules` command
4. Implemented only for `StreamValidator` and `JSONValidator`


Here is an example:

```
const api = require('ddf-validation');
const expectedRules = 'INCORRECT_FILE CONCEPTS_NOT_FOUND';
const StreamValidator = api.StreamValidator;
const streamValidator = new StreamValidator(path, {
  includeRules,
  excludeDirs: ['my cool assets', 'some-other-folder'],
  isMultithread: true
});

streamValidator.on('issue', issue => {
  // only one type of issue (INCORRECT_FILE and CONCEPTS_NOT_FOUND) should be catched
});

streamValidator.on('finish', err => {
  console.log('finished');
});

api.validate(streamValidator);
```

## datapackage.json creation

There is a function for `datapackage.json` creation in API: `createDataPackage`.

`createDataPackage` parameters description:

* ddfRootFolder: `string` - path to DDF folder
* onNotice: `Function` - function that will be called when notice output should be expected
* onDataPackageReady: `Function` - function that will be called when `datapackage.json` creation was finished
* newDataPackagePriority: `boolean` (default `false`) - this is a flag that defines policy regarding existing `datapackage.json`.
If `true` then current `datapackage.json` will be renamed and new one will be created as `datapackage.json`.
Otherwise, `createDataPackage` behavior is next: if `datapackage.json` exists then current datapackage will not be changed
 and new one will be created as `datapackage.json.TIME_LABEL`.

```
const api = require('ddf-validation');

const ddfRootFolder = '.';

api.createDataPackage(ddfRootFolder, message => {
  console.log(message);
}, (err) => {
  if (err) {
    console.log(err);
  }
});

```
