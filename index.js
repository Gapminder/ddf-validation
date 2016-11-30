'use strict';

const EventEmitter = require('events');
const async = require('async');
const _ = require('lodash');
const DdfDataSet = require('./lib/ddf-definitions/ddf-data-set');
const ddfRules = require('./lib/ddf-rules');
const IssuesFilter = require('./lib/utils/issues-filter');
const CONCURRENT_OPERATIONS_AMOUNT = 30;

const isSimpleRule = ruleObject => !!ruleObject.rule;
const isRecordRule = ruleObject => !!ruleObject.recordRule;
const isAggregativeRule = ruleObject => !!ruleObject.aggregateRecord && !!ruleObject.aggregativeRule;
const sameTranslation = (key, fileDescriptor) => fileDescriptor.isTranslation === ddfRules[key].isTranslation;
const noTranslation = (key, fileDescriptor) => !fileDescriptor.isTranslation && !ddfRules[key].isTranslation;

function processSimpleRules(context, onIssue) {
  Object.getOwnPropertySymbols(ddfRules)
    .filter(key => isSimpleRule(ddfRules[key]))
    .filter(key => context.issuesFilter.isAllowed(key))
    .map(key => ddfRules[key].rule(context.ddfDataSet))
    .filter(issues => !_.isEmpty(issues))
    .forEach(issue => onIssue(issue));
}

/*eslint max-params: ["error", 4]*/
function createRecordAggregationProcessor(context, ddfDataSet, fileDescriptor, resultHandler) {
  return (record, line) => {
    Object.getOwnPropertySymbols(ddfRules)
      .filter(key => sameTranslation(key, fileDescriptor) || noTranslation(key, fileDescriptor))
      .filter(key => isRecordRule(ddfRules[key]) || isAggregativeRule(ddfRules[key]))
      .filter(key => context.issuesFilter.isAllowed(key))
      .forEach(key => {
        if (isRecordRule(ddfRules[key])) {
          const issues = ddfRules[key].recordRule({ddfDataSet, fileDescriptor, record, line});

          resultHandler(issues);
        }

        if (isAggregativeRule(ddfRules[key])) {
          ddfRules[key].aggregateRecord({ddfDataSet, fileDescriptor, record, line}, key);
        }
      });
  };
}

function processAggregation(context, ddfDataSet, fileDescriptor, resultHandler) {
  Object.getOwnPropertySymbols(ddfRules)
    .filter(key => sameTranslation(key, fileDescriptor) || noTranslation(key, fileDescriptor))
    .filter(key => isAggregativeRule(ddfRules[key]))
    .filter(key => context.issuesFilter.isAllowed(key))
    .forEach(key => {
      resultHandler(ddfRules[key].aggregativeRule({ddfDataSet, fileDescriptor}, key));
    });
}

function createRecordBasedRulesProcessor(context, fileDescriptor, resultHandler) {
  const ddfDataSet = context.ddfDataSet;

  return onDataPointReady => {
    context.ddfDataSet.getDataPoint().loadFile(
      fileDescriptor,
      createRecordAggregationProcessor(context, ddfDataSet, fileDescriptor, resultHandler),
      () => {
        processAggregation(context, ddfDataSet, fileDescriptor, resultHandler);
        onDataPointReady();
      }
    );
  };
}

function createRecordBasedRuleProcessor(context, fileDescriptor, resultHandler) {
  const ddfDataSet = context.ddfDataSet;

  return onDataPointReady => {
    context.ddfDataSet.getDataPoint().loadFile(
      fileDescriptor,
      (record, line) => {
        if (context.issuesFilter.isAllowed(context.ruleKey)) {
          if (isRecordRule(context.rule)) {
            const issues = context.rule.recordRule({ddfDataSet, fileDescriptor, record, line});

            resultHandler(issues);
          }

          if (isAggregativeRule(context.rule)) {
            context.rule.aggregateRecord({
              ddfDataSet,
              fileDescriptor,
              record,
              line
            }, context.ruleKey);
          }
        }
      },
      () => {
        if (sameTranslation(context.ruleKey, fileDescriptor) || noTranslation(context.ruleKey, fileDescriptor)) {
          if (context.issuesFilter.isAllowed(context.ruleKey)) {
            if (isAggregativeRule(ddfRules[context.ruleKey])) {
              resultHandler(ddfRules[context.ruleKey].aggregativeRule({ddfDataSet, fileDescriptor}, context.ruleKey));
            }
          }
        }


        onDataPointReady();
      }
    );
  };
}

function getValidationActions(context) {
  const dataPointActions = context.ddfDataSet.getDataPoint().fileDescriptors.map(fileDescriptor =>
    context.processRecordBasedRules(fileDescriptor));
  const dataPointTransActions = _.flattenDeep(
    context.ddfDataSet.getDataPoint().fileDescriptors.map(fileDescriptor =>
      fileDescriptor.getExistingTranslationDescriptors().map(transFileDescriptor =>
        context.processRecordBasedRules(transFileDescriptor, fileDescriptor)))
  );

  return _.concat(dataPointActions, dataPointTransActions);
}

function toArray(value) {
  return _.isArray(value) ? value : [value];
}

class JSONValidator {
  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
  }

  processRecordBasedRules(fileDescriptor) {
    return createRecordBasedRulesProcessor(this, fileDescriptor, resultParam => {
      const result = toArray(resultParam);

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
      processSimpleRules(this, issue => {
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

  processRecordBasedRules(dataPointDetail) {
    return createRecordBasedRulesProcessor(this, dataPointDetail, resultParam => {
      const result = toArray(resultParam);

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
      processSimpleRules(this, issue => {
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

  processRecordBasedRules(dataPointDetail) {
    return createRecordBasedRulesProcessor(this, dataPointDetail, result => {
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

    const validateSimpleRules = () => {
      const issues = Object.getOwnPropertySymbols(ddfRules)
        .filter(key => isSimpleRule(ddfRules[key]))
        .filter(key => this.issuesFilter.isAllowed(key))
        .map(key => ddfRules[key].rule(this.ddfDataSet))
        .filter(newIssues => !_.isEmpty(newIssues));

      if (!_.isEmpty(issues)) {
        this.isDataSetCorrect = false;
      }
    };

    if (this.settings.datapointlessMode) {
      this.issueEmitter.emit('finish', null, this.isDataSetCorrect);

      return;
    }

    this.ddfDataSet.load(() => {
      validateSimpleRules();

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


exports.createRecordBasedRulesProcessor = createRecordBasedRulesProcessor;
exports.createRecordBasedRuleProcessor = createRecordBasedRuleProcessor;
exports.JSONValidator = JSONValidator;
exports.StreamValidator = StreamValidator;
exports.SimpleValidator = SimpleValidator;
exports.validate = validator => validator.validate();
