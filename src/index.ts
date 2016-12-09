import {EventEmitter} from 'events';
import {parallelLimit} from 'async';
import {isEmpty, flattenDeep, concat, compact, isArray} from 'lodash';
import {DdfDataSet} from './ddf-definitions/ddf-data-set';
import {allRules as ddfRules} from './ddf-rules';
import {IssuesFilter} from './utils/issues-filter';
import {Issue} from './ddf-rules/issue';

const CONCURRENT_OPERATIONS_AMOUNT = 30;

const isSimpleRule = ruleObject => !!ruleObject.rule;
const isRecordRule = ruleObject => !!ruleObject.recordRule;
const isAggregativeRule = ruleObject => !!ruleObject.aggregateRecord && !!ruleObject.aggregativeRule;
const sameTranslation = (key, fileDescriptor) => fileDescriptor.isTranslation === ddfRules[key].isTranslation;
const noTranslation = (key, fileDescriptor) => !fileDescriptor.isTranslation && !ddfRules[key].isTranslation;

function clearGlobalStates() {
  Object.getOwnPropertySymbols(ddfRules)
    .filter(key => ddfRules[key].resetStorage)
    .forEach(key => ddfRules[key].resetStorage());
}

function processSimpleRules(context, onIssue) {
  Object.getOwnPropertySymbols(ddfRules)
    .filter(key => isSimpleRule(ddfRules[key]))
    .filter(key => context.issuesFilter.isAllowed(key))
    .map(key => ddfRules[key].rule(context.ddfDataSet))
    .filter(issues => !isEmpty(issues))
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

export function createRecordBasedRulesProcessor(context, fileDescriptor, resultHandler) {
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

export function createRecordBasedRuleProcessor(context, fileDescriptor, resultHandler) {
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

function getValidationActions(context): Array<any> {
  const dataPointActions = context.ddfDataSet.getDataPoint().fileDescriptors.map(fileDescriptor =>
    context.processRecordBasedRules(fileDescriptor));
  const dataPointTransActions = flattenDeep(
    context.ddfDataSet.getDataPoint().fileDescriptors.map(fileDescriptor =>
      fileDescriptor.getExistingTranslationDescriptors().map(transFileDescriptor =>
        context.processRecordBasedRules(transFileDescriptor, fileDescriptor)))
  );

  return concat(dataPointActions, dataPointTransActions);
}

function toArray(value) {
  return compact(isArray(value) ? value : [value]);
}

export class JSONValidator {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public out: Array<any>;
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;

  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
  }

  processRecordBasedRules(fileDescriptor) {
    return createRecordBasedRulesProcessor(this, fileDescriptor, resultParam => {
      const result = toArray(resultParam);

      if (!isEmpty(result)) {
        this.out = this.out.concat(result.map(issue => issue.view()));
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    clearGlobalStates();
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);
    this.out = [];

    this.ddfDataSet.load(() => {
      processSimpleRules(this, issue => {
        if (!isArray(issue)) {
          this.out.push(issue.view());
        }

        if (isArray(issue)) {
          issue.forEach((resultRecord: Issue) => {
            this.out.push(resultRecord.view());
          });
        }
      });

      if (this.settings.datapointlessMode) {
        this.issueEmitter.emit('finish', null, this.out);

        return;
      }

      parallelLimit(getValidationActions(this), CONCURRENT_OPERATIONS_AMOUNT, err => {
        this.issueEmitter.emit('finish', err, this.out);
      });
    });
  }
}

export class StreamValidator {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;

  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
  }

  processRecordBasedRules(dataPointDetail) {
    return createRecordBasedRulesProcessor(this, dataPointDetail, resultParam => {
      const result = toArray(resultParam);

      if (!isEmpty(result)) {
        result.map(issue => this.issueEmitter.emit('issue', issue.view()));
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    clearGlobalStates();
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    this.ddfDataSet.load(() => {
      processSimpleRules(this, issue => {
        if (!isArray(issue)) {
          this.issueEmitter.emit('issue', issue.view());
        }

        if (isArray(issue)) {
          issue.forEach((resultRecord: Issue) => {
            this.issueEmitter.emit('issue', resultRecord.view());
          });
        }
      });

      if (this.settings.datapointlessMode) {
        this.issueEmitter.emit('finish');

        return;
      }

      parallelLimit(getValidationActions(this), CONCURRENT_OPERATIONS_AMOUNT, err => {
        this.issueEmitter.emit('finish', err);
      });
    });
  }
}

export class SimpleValidator {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;
  public isDataSetCorrect: boolean;

  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
    this.isDataSetCorrect = true;
  }

  processRecordBasedRules(dataPointDetail) {
    return createRecordBasedRulesProcessor(this, dataPointDetail, result => {
      if (!isEmpty(result)) {
        this.isDataSetCorrect = false;
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    clearGlobalStates();
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    const validateSimpleRules = () => {
      const issues = Object.getOwnPropertySymbols(ddfRules)
        .filter(key => isSimpleRule(ddfRules[key]))
        .filter(key => this.issuesFilter.isAllowed(key))
        .map(key => ddfRules[key].rule(this.ddfDataSet))
        .filter(newIssues => !isEmpty(newIssues));

      if (!isEmpty(issues)) {
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

      parallelLimit(getValidationActions(this), CONCURRENT_OPERATIONS_AMOUNT, err => {
        this.issueEmitter.emit('finish', err, this.isDataSetCorrect);
      });
    });
  }
}

export const validate = validator => validator.validate();
