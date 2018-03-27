# ddf-validation Developer's guide 

## Registry of issues types

Registry is a structure that contains all available rules and their description.
First of all new rule should be added to the [rules registry](../src/ddf-rules/registry.js).

A new rule should be added in the next way:

```javascript
exports.MY_NEW_RULE = Symbol.for('MY_NEW_RULE');
```

Note: `Symbol.for` syntax is mandatory.

Also description should be defined for a new rule as follows

```javascript
exports.descriptions = {
  /// ...
  [exports.MY_NEW_RULE]: 'Description for this rule',
  /// ...
};
```

## Types of rules

There are 5 types of rules supported by `ddf-validation`:

* General rules
* DataPackage rules
* Concept rules
* Entity rules
* Data points rules

### General rules

General rules are applied to whole DDF dataset. And the don't validate Concepts, Entities and 
Datapoints on their own. For example, rule `Folder is not DDF`.

### DataPackage rules

This kind of rules is exclusively about `ddf--index` file. For example, `Index is not found`
or `File in index doesn't exist`.

`Index rules` are placed [here](../src/ddf-rules/data-package-rules).

### Concept rules

This kind of rules is exclusively about Concepts. For example, `Concept ID is not unique`.

`Concept rules` are placed [here](../src/ddf-rules/concept-rules).

### Entity rules

This kind of rules is exclusively about Entities. For example, `Entity header is not Concept`.

`Entity rules` are placed [here](../src/ddf-rules/entity-rules).

### Data points rules

This kind of rules is exclusively about Data points. For example, `Unexpected time value`.

`Data points` are placed [here](../src/ddf-rules/data-point-rules).

## Issue

Issue is a class that describes single rule violation. Code is placed [here](../src/ddf-rules/issue.js).

A simple way to create Issue object is:

```javascript
const registry = require('./registry');
const Issue = require('./issue');
// ....
const issue = new Issue(registry.MY_NEW_RULE);
```

Constructor `Issue` has only one argument - type of issue in accordance with the registry.

With a help of following methods you can populate Issue instance with additional information regarding rule violation.

* Set path contains location of the file where issue was found

```javascript
setPath : (
  path: String|Array<String>
) => Issue
```

* Set an additional information (data) regarding this issue

```javascript
setData : (
  data: Object
) => Issue
```

* Set suggestions for this issue. Suggestions is an object that describes how to solve found issue.

```javascript
setSuggestions : (
  suggestions: Array<String>
) => Issue
```

* Set `warning` flag for particular issue:

```javascript
warning() => Issue
```

### How to create an Issue instance

```javascript
const registry = require('./registry');
const Issue = require('./issue');
// ....
const data = {
  wrongWord: 'foo',
  line: 665
};
const issue = new Issue(registry.MY_NEW_RULE)
  .setData(data)
  .setPath('/path/to/file-with-this-issue.csv').
  .setSuggestions(['bar']);
// also you can use next class members:
console.log(issue.type);
console.log(issue.path);
console.log(issue.data);
console.log(issue.suggestions);
console.log(issue.isWarning);
```

By the way, all rules should return an issue or array of issues.

## DdfData

This class describes DDF Dataset in general. Code is placed [here](../src/ddf-definition/ddf-data-set.js)

### How to create a DdfData instance

```javascript
const DdfDataSet = require('./lib/ddf-definitions/ddf-data-set');
// ...
const ddfDataSet = new DdfDataSet('/path-to-ddf-data-set-folder');
```

Constructor `DdfDataSet` has only one argument - path of DDF dataset.

Also `DdfDataSet` class has additional methods:

* Get object that represents Dataset's concepts

```javascript
getConcept : () => Concept
```

* Get object that represents Dataset's entities

```javascript
getEntity : () => Entity
```

* Get object that represents Dataset's datapoints

```javascript
getDataPoint : () => DataPoint
```

* Load DDF dataset data.

```javascript
load : (
  // callback function
  cb: Function
) => void
```

Note: `Concept`, `Entity` and `DataPoint` classes are placed:
[here](../src/ddf-definitions/concept.js), [here](../src/ddf-definitions/entity.js) and [here](../src/ddf-definitions/data-point.js) respectively.

Typical `DdfDataSet` using is:

```javascript
const DdfDataSet = require('./lib/ddf-definitions/ddf-data-set');
// ...
const ddfDataSet = new DdfDataSet(utils.ddfRootFolder);

ddfDataSet.load(() => {
  // rules processing, for example...
});
```

## There are two ways of rule implementation

There are two kinds of rule implementation:

* Datapoint specific rule
* Non datapoint specific rule (for concepts, entities, datasets, etc...)

This is due to the difference of sizes between Data points and other type of content. 

### Non Data point rule creation

```javascript
const registry = require('./registry');
const Issue = require('./issue');

module.exports = {
  // ...
  [registry.MY_NEW_RULE]: ddfDataSet => {
    const result = [];

    // analyze ddfDataSet and put an issue to result array if needed

    return result;
  },
  // ...
};
```

### Data point rule creation

This kind of rule has only one difference comparing to other rules: second argument: `dataPointDetail`
that contains all needed information about current set(file) datapoints.

This is due to the complexity of simultaneous loading of all datapoints.

```javascript
const registry = require('./registry');
const Issue = require('./issue');

module.exports = {
  // ...
  [registry.MY_NEW_RULE]: (ddfDataSet, dataPointDetail) => {
    const result = [];

    // analyze ddfDataSet and dataPointDetail
    // put an issue to result array if needed

    return result;
  },
  // ...
};
```

More information regarding `ddf-validation` solution is placed in the test folder.


# Testing

`npm test` or `npm run n-test` without eslint

# Release routines
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
