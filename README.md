# ddf-validation

[npm version](https://www.npmjs.com/package/ddf-validation)

## Install

`npm i ddf-validation -g`

## Test

`npm test` or `npm run n-test` without eslint

## Console utility usage

`validate-ddf <root> [options]`

```
Commands:
  root  DDF Root directory

Options:
  -i               Generate index file
  -j               Fix wrong JSONs
  --rules          print information regarding supported rules
  --include-tags   Process only issues by selected tags
  --exclude-tags   Process all tags except selected
  --include-rules  Process only issues by selected rules
  --exclude-rules  Process all rules except selected

Examples:
  validate-ddf ../ddf-example                                        validate DDF datasets for the root
  validate-ddf ../ddf-example -i                                     generate ddf--index file
  validate-ddf ../ddf-example -j                                     fix JSONs for this DDF dataset
  validate-ddf ../ddf-example --rules                                print information regarding supported rules
  validate-ddf ../ddf-example --include-rules "INCORRECT_JSON_FIELD" Validate only by  INCORRECT_JSON_FIELD rule
  validate-ddf ../ddf-example --exclude-tags "WARNING_TAG"           Get all kinds of issues except warnings
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
const streamValidator = new StreamValidator('path to ddf dataset');

streamValidator.on('issue', () => {
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
const simpleValidator = new SimpleValidator('./test/fixtures/good-folder-indexed');

simpleValidator.on('finish', (err, isDataSetCorrect) => {
  // isDataSetCorrect === true if DDF dataset is correct
  // isDataSetCorrect === true if DDF dataset is incorrect
});

api.validate(simpleValidator);
```

### Custom rules

Also all validators supports validation parameters that corresponds with command line:

 * includeTags   Process only issues by selected tags
 * excludeTags   Process all tags except selected
 * includeRules  Process only issues by selected rules
 * excludeRules  Process all rules except selected
 
Here is an example:

```
const api = require('ddf-validation');
const expectedRule = 'INCORRECT_FILE';
const StreamValidator = api.StreamValidator;
const streamValidator = new StreamValidator(path, {includeRules: expectedRule});

streamValidator.on('issue', issue => {
  // only one type of issue (INCORRECT_FILE) should be catched
});

streamValidator.on('finish', err => {
  console.log('finished');
});

api.validate(streamValidator);
```

## index file creation

`validate-ddf <folder with DDF data set> -i`

Attention: existing `ddf--index.csv` file will be overwritten!

## Developer guide

[you can see it here](doc/developer-guide.md)

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
