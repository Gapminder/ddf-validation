'use strict';

const EventEmitter = require('events');
const async = require('async');
const _ = require('lodash');
const DdfDataSet = require('./lib/ddf-definitions/ddf-data-set');
const ddfRules = require('./lib/ddf-rules');
const ddfDataPointRules = require('./lib/ddf-rules/data-point-rules');
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

class JSONValidator {
  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
  }

  prepareDataPointProcessor(dataPointDetail) {
    const ddfDataSet = this.ddfDataSet;

    return onDataPointReady => {
      this.ddfDataSet.getDataPoint().loadFile(
        dataPointDetail,
        (dataPointRecord, line) => {
          Object.getOwnPropertySymbols(ddfDataPointRules)
            .filter(key => this.issuesFilter.isAllowed(key))
            .forEach(key => {
              const result = ddfDataPointRules[key]({ddfDataSet, dataPointDetail, dataPointRecord, line});

              if (!_.isEmpty(result)) {
                this.out = this.out.concat(result.map(issue => issue.view()));
              }
            });
        },
        err => onDataPointReady(err)
      );
    };
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

      const dataPointActions = [];

      this.ddfDataSet.getDataPoint().fileDescriptors.forEach(detail => {
        dataPointActions.push(this.prepareDataPointProcessor(detail));
      });

      async.parallelLimit(dataPointActions, CONCURRENT_OPERATIONS_AMOUNT, err => {
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
    const ddfDataSet = this.ddfDataSet;

    return onDataPointReady => {
      this.ddfDataSet.getDataPoint().loadFile(
        dataPointDetail,
        (dataPointRecord, line) => {
          Object.getOwnPropertySymbols(ddfDataPointRules)
            .filter(key => this.issuesFilter.isAllowed(key))
            .forEach(key => {
              const result = ddfDataPointRules[key]({ddfDataSet, dataPointDetail, dataPointRecord, line});

              if (!_.isEmpty(result)) {
                result.map(issue => this.issueEmitter.emit('issue', issue.view()));
              }
            });
        },
        err => onDataPointReady(err)
      );
    };
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

      const dataPointActions = [];

      this.ddfDataSet.getDataPoint().fileDescriptors.forEach(detail => {
        dataPointActions.push(this.prepareDataPointProcessor(detail));
      });

      async.parallelLimit(dataPointActions, CONCURRENT_OPERATIONS_AMOUNT, err => {
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
    const ddfDataSet = this.ddfDataSet;

    return onDataPointReady => {
      if (!this.isDataSetCorrect) {
        onDataPointReady();
        return;
      }

      this.ddfDataSet.getDataPoint().loadFile(
        dataPointDetail,
        (dataPointRecord, line) => {
          Object.getOwnPropertySymbols(ddfDataPointRules)
            .filter(key => this.issuesFilter.isAllowed(key))
            .forEach(key => {
              const result = ddfDataPointRules[key]({ddfDataSet, dataPointDetail, dataPointRecord, line});

              if (!_.isEmpty(result)) {
                this.isDataSetCorrect = false;
              }
            });
        },
        err => onDataPointReady(err)
      );
    };
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

    const getDataPointsActions = () => this.ddfDataSet.getDataPoint().fileDescriptors
      .map(detail => this.prepareDataPointProcessor(detail));

    this.ddfDataSet.load(() => {
      validateNonDataPoints();

      if (!this.isDataSetCorrect) {
        this.issueEmitter.emit('finish', null, this.isDataSetCorrect);
        return;
      }

      async.parallelLimit(getDataPointsActions(), CONCURRENT_OPERATIONS_AMOUNT, err => {
        this.issueEmitter.emit('finish', err, this.isDataSetCorrect);
      });
    });
  }
}

exports.JSONValidator = JSONValidator;
exports.StreamValidator = StreamValidator;
exports.SimpleValidator = SimpleValidator;
exports.validate = validator => validator.validate();
