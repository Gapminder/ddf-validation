'use strict';

const EventEmitter = require('events');
const async = require('async');
const _ = require('lodash');
const DdfDataSet = require('./lib/ddf-definitions/ddf-data-set');
const ddfRules = require('./lib/ddf-rules');
const ddfDataPointRules = require('./lib/ddf-rules/data-point-rules');
const ddfDataPointTransRules = require('./lib/ddf-rules/translation-rules/data-point-rules');
const IssuesFilter = require('./lib/utils/issues-filter');

const CONCURRENT_OPERATIONS_AMOUNT = 30;

function walkNonDataPointIssue(context, onIssue) {
  ddfRules.forEach(ruleSet => {
    Object.getOwnPropertySymbols(ruleSet)
      .filter(key => context.issuesFilter.isAllowed(key))
      .map(key => ruleSet[key](context.ddfDataSet))
      .filter(issues => !_.isEmpty(issues))
      .forEach(issue => onIssue(issue));
  });
}

function createDatapointProcessor(context, dataPointFileDescriptor, resultHandler) {
  const ddfDataSet = context.ddfDataSet;

  return onDataPointReady => {
    context.ddfDataSet.getDataPoint().loadFile(
      dataPointFileDescriptor,
      (dataPointRecord, line) => {
        Object.getOwnPropertySymbols(ddfDataPointRules)
          .filter(key => context.issuesFilter.isAllowed(key))
          .forEach(key => {
            const issues = ddfDataPointRules[key]({ddfDataSet, dataPointFileDescriptor, dataPointRecord, line});

            resultHandler(issues);
          });
      },
      onDataPointReady
    );
  };
}

function createDatapointTranslationProcessor(context, dataPointFileTransDescriptor, resultHandler) {
  const ddfDataSet = context.ddfDataSet;

  return onDataPointReady => {
    context.ddfDataSet.getDataPoint().loadFile(
      dataPointFileTransDescriptor,
      (transRecord, line) => {
        Object.getOwnPropertySymbols(ddfDataPointTransRules)
          .filter(key => context.issuesFilter.isAllowed(key))
          .forEach(key => {
            const issues =
              ddfDataPointTransRules[key]({ddfDataSet, dataPointFileTransDescriptor, transRecord, line});

            resultHandler(issues);
          });
      },
      onDataPointReady
    );
  };
}

function createDatapointTranslationByRuleProcessor(context, dataPointFileTransDescriptor, resultHandler) {
  const ddfDataSet = context.ddfDataSet;

  return onDataPointReady => {
    context.ddfDataSet.getDataPoint().loadFile(
      dataPointFileTransDescriptor,
      (transRecord, line) => {
        const issues =
          ddfDataPointTransRules[context.ruleKey]({ddfDataSet, dataPointFileTransDescriptor, transRecord, line});

        resultHandler(issues);
      },
      onDataPointReady
    );
  };
}

function getValidationActions(context) {
  const dataPointActions =
    context.ddfDataSet.getDataPoint().fileDescriptors
      .map(fileDescriptor =>
        context.prepareDataPointProcessor(fileDescriptor));
  const dataPointTransActions = _.flattenDeep(
    context.ddfDataSet.getDataPoint().fileDescriptors
      .map(fileDescriptor =>
        fileDescriptor.getExistingTranslationDescriptors()
          .map(transFileDescriptor =>
            context.prepareDataPointTransProcessor(transFileDescriptor, fileDescriptor)))
  );

  return _.concat(dataPointActions, dataPointTransActions);
}

class JSONValidator {
  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
  }

  prepareDataPointProcessor(dataPointFileDescriptor) {
    return createDatapointProcessor(this, dataPointFileDescriptor, result => {
      if (!_.isEmpty(result)) {
        this.out = this.out.concat(result.map(issue => issue.view()));
      }
    });
  }

  prepareDataPointTransProcessor(dataPointFileTransDescriptor, fileDescriptor) {
    dataPointFileTransDescriptor.primaryKey = fileDescriptor.primaryKey;

    return createDatapointTranslationProcessor(this, dataPointFileTransDescriptor, result => {
      if (!_.isEmpty(result)) {
        this.out = this.out.concat(result.map(issue => issue.view()));
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);
    this.out = [];

    this.ddfDataSet.load(() => {
      walkNonDataPointIssue(this, issue => {
        if (!_.isArray(issue)) {
          this.out.push(issue.view());
        }

        if (_.isArray(issue)) {
          issue.forEach(resultRecord => {
            this.out.push(resultRecord.view());
          });
        }
      });

      if (this.settings.datapointlessMode) {
        this.issueEmitter.emit('finish', null, this.out);

        return;
      }

      async.parallelLimit(getValidationActions(this), CONCURRENT_OPERATIONS_AMOUNT, err => {
        this.issueEmitter.emit('finish', err, this.out);
      });
    });
  }
}

class StreamValidator {
  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
  }

  prepareDataPointProcessor(dataPointDetail) {
    return createDatapointProcessor(this, dataPointDetail, result => {
      if (!_.isEmpty(result)) {
        result.map(issue => this.issueEmitter.emit('issue', issue.view()));
      }
    });
  }

  prepareDataPointTransProcessor(dataPointFileTransDescriptor, fileDescriptor) {
    dataPointFileTransDescriptor.primaryKey = fileDescriptor.primaryKey;

    return createDatapointTranslationProcessor(this, dataPointFileTransDescriptor, result => {
      if (!_.isEmpty(result)) {
        result.map(issue => this.issueEmitter.emit('issue', issue.view()));
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    this.ddfDataSet.load(() => {
      walkNonDataPointIssue(this, issue => {
        if (!_.isArray(issue)) {
          this.issueEmitter.emit('issue', issue.view());
        }

        if (_.isArray(issue)) {
          issue.forEach(resultRecord => {
            this.issueEmitter.emit('issue', resultRecord.view());
          });
        }
      });

      if (this.settings.datapointlessMode) {
        this.issueEmitter.emit('finish');

        return;
      }

      async.parallelLimit(getValidationActions(this), CONCURRENT_OPERATIONS_AMOUNT, err => {
        this.issueEmitter.emit('finish', err);
      });
    });
  }
}

class SimpleValidator {
  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
    this.isDataSetCorrect = true;
  }

  prepareDataPointProcessor(dataPointDetail) {
    return createDatapointProcessor(this, dataPointDetail, result => {
      if (!_.isEmpty(result)) {
        this.isDataSetCorrect = false;
      }
    });
  }

  prepareDataPointTransProcessor(dataPointFileTransDescriptor, fileDescriptor) {
    dataPointFileTransDescriptor.primaryKey = fileDescriptor.primaryKey;

    return createDatapointTranslationProcessor(this, dataPointFileTransDescriptor, result => {
      if (!_.isEmpty(result)) {
        this.isDataSetCorrect = false;
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    const validateNonDataPoints = () => {
      for (const ruleSet of ddfRules) {
        const issues = Object.getOwnPropertySymbols(ruleSet)
          .filter(key => this.issuesFilter.isAllowed(key))
          .map(key => ruleSet[key](this.ddfDataSet))
          .filter(newIssues => !_.isEmpty(newIssues));

        if (!_.isEmpty(issues)) {
          this.isDataSetCorrect = false;
          break;
        }
      }
    };

    if (this.settings.datapointlessMode) {
      this.issueEmitter.emit('finish', null, this.isDataSetCorrect);

      return;
    }

    this.ddfDataSet.load(() => {
      validateNonDataPoints();

      if (!this.isDataSetCorrect) {
        this.issueEmitter.emit('finish', null, this.isDataSetCorrect);
        return;
      }

      async.parallelLimit(getValidationActions(this), CONCURRENT_OPERATIONS_AMOUNT, err => {
        this.issueEmitter.emit('finish', err, this.isDataSetCorrect);
      });
    });
  }
}


exports.createDatapointProcessor = createDatapointProcessor;
exports.createDatapointTranslationProcessor = createDatapointTranslationProcessor;
exports.createDatapointTranslationByRuleProcessor = createDatapointTranslationByRuleProcessor;
exports.JSONValidator = JSONValidator;
exports.StreamValidator = StreamValidator;
exports.SimpleValidator = SimpleValidator;
exports.validate = validator => validator.validate();
