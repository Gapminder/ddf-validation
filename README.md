# ddf-validation

This nodejs app checks the validity of a DDF datasets and generates datapackage.
[npm version](https://www.npmjs.com/package/ddf-validation)

## System requirements

You have [node.js](https://nodejs.org/en/) environment installed on your computer.  
You

## Install

`npm i ddf-validation -g`

## Console utility usage

`validate-ddf [root] [options]`

```
Commands:
  root  DDF Root directory. Current directory will be processed if DDF Root directory is undefined.

Options:
  -v                     Print current version
  -i                     Generate datapackage.json
  --compress-datapackage Compress datapackage.json file
  --translations         Rewrite "translations" section in existing datapackage.json
  --content              Rewrite "resources" and "ddfSchema" sections in existing datapackage.json
  -j                     Fix wrong JSONs
  --rules                Print information regarding supported rules
  --multithread          Validate datapoints in separate threads
  --use-all-cpu          Use all CPU during validation via multithread mode
  --datapointless        Forget about datapoint validation
  --hidden               Allow hidden folders validation
  --include-tags         Process only issues by selected tags
  --exclude-tags         Process all tags except selected
  --include-rules        Process only issues by selected rules
  --exclude-rules        Process all rules except selected
  --exclude-dirs         Process all directories except selected.
  --heap                 Set custom heap size

Examples:
  validate-ddf ../ddf-example                                                        validate DDF datasets for the root
  validate-ddf ../ddf-example -i                                                     generate datapackage.json file
  validate-ddf ../ddf-example -i --translations                                      update only "translations" section in datapackage.json
  validate-ddf ../ddf-example -i --translations --content                            rewrite "translations", "resources" and "ddfSchema" sections in datapackage.json
  validate-ddf ../ddf-example -j                                                     fix JSONs for this DDF dataset
  validate-ddf  --rules                                                              print information regarding supported rules
  validate-ddf ../ddf-example --multithread                                          validate datapoints for `ddf-example` in separate threads
  validate-ddf ../ddf-example --multithread --use-all-cpu                            use all CPU during validation via multithread mode
  validate-ddf ../ddf-example --datapointless                                        forget about datapoint validation
  validate-ddf ../ddf-example --hidden                                               allow hidden folders validation
  validate-ddf ../ddf-example --include-rules "INCORRECT_JSON_FIELD"                 validate only by  INCORRECT_JSON_FIELD rule
  validate-ddf ../ddf-example --exclude-tags "WARNING"                               get all kinds of issues except warnings
  validate-ddf ../ddf-example --exclude-dirs "etl,foo-dir"                           validate "ddf-example" and its subdirectories except "etl" and "foo-dir"
  validate-ddf ../ddf-example --exclude-dirs "'dir1 with spaces','dir2 with spaces'" validate "ddf-example" and its subdirectories that contain spaces
  validate-ddf ../ddf-example --exclude-dirs '"dir1 with spaces","dir2 with spaces"' validate "ddf-example" and its subdirectories that contain spaces: case 2
  validate-ddf ../ddf-example -i --heap 4096 --compress-datapackage                  create compressed datapackage.json via 4Gb heap
```

## API usage

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

## Developer guide

[you can see it here](doc/developer-guide.md)


## Test

`npm test` or `npm run n-test` without eslint

## Release
1. `npm run changelog` - generates content for `CHANGELOG.md` file with changes that have happened since last release
2. `npm version` - this one is a bit more complicated. Let's start with what it needs in order to run.
  - `CONVENTIONAL_GITHUB_RELEASER_TOKEN` environment variable should be set up for this command:

    Example: `CONVENTIONAL_GITHUB_RELEASER_TOKEN=aaaaaaaaaabbbbbbbbbbccccccccccffffffffff npm version minor`

  - this command understands following parameters:
    - `major` (having initially version **0.0.0** by applying this option it will be changed to **1.0.0**).

        Example:
        ```
          CONVENTIONAL_GITHUB_RELEASER_TOKEN=aaaaaaaaaabbbbbbbbbbccccccccccffffffffff npm version major
        ```

    - `minor` (having initially version **0.0.0** by applying this option it will be changed to **0.1.0**)

        Example:
        ```
          CONVENTIONAL_GITHUB_RELEASER_TOKEN=aaaaaaaaaabbbbbbbbbbccccccccccffffffffff npm version minor
        ```

    - `patch` (having initially version **0.0.0** by applying this option it will be changed to **0.0.1**)

        Example:
        ```
          CONVENTIONAL_GITHUB_RELEASER_TOKEN=aaaaaaaaaabbbbbbbbbbccccccccccffffffffff npm version patch
        ```

    During the release process two files will be changed and pushed to github:
      1. CHANGELOG.md - because of added history.
      2. package.json - because of bumped version.

    **Note:** `aaaaaaaaaabbbbbbbbbbccccccccccffffffffff` - is the fake token. In order to generate proper one you need to do following: [github tutorial](https://help.github.com/articles/creating-an-access-token-for-command-line-use)

    **Important note:** you should merge `development` branch into `master` and **performing `npm verison` on `master`** branch according to our [gitflow](https://github.com/valor-software/valor-style-guides/tree/master/gitflow)

    **Even more important note:** while generating token (using tutorial given above) you need to choose which permissions should be granted to it. For our *release purposes* you need to choose all permissions under the section `repo`
