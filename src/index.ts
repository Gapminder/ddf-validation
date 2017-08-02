import * as path from 'path';
import { EventEmitter } from 'events';
import { parallelLimit } from 'async';
import { isEmpty, flattenDeep, concat, isArray, compact } from 'lodash';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import { allRules as ddfRules } from './ddf-rules';
import { IssuesFilter } from './utils/issues-filter';
import { Issue } from './ddf-rules/issue';
import {
  CONCURRENT_OPERATIONS_AMOUNT,
  isSimpleRule,
  isRecordRule,
  isAggregativeRule,
  sameTranslation,
  noTranslation,
  toArray,
  getDataPointFilesChunks,
  createRecordBasedRulesProcessor,
  getDataPointFileDescriptorsGroups
} from './shared';
import { logger } from './utils';
import { FileDescriptor } from "./data/file-descriptor";

const child_process = require('child_process');
const os = require('os');
const cpuCount = os.cpus().length;

function clearGlobalStates() {
  Object.getOwnPropertySymbols(ddfRules)
    .filter(key => ddfRules[key].resetStorage)
    .forEach(key => ddfRules[key].resetStorage());
}

function processSimpleRules(context, onIssue) {
  const rulesKeys = Object.getOwnPropertySymbols(ddfRules).filter(key => isSimpleRule(ddfRules[key]) && context.issuesFilter.isAllowed(key));

  for (let key of rulesKeys) {
    const issues = ddfRules[key].rule(context.ddfDataSet);

    if (!isEmpty(issues)) {
      if (isArray(issues)) {
        issues.forEach(issue => onIssue(issue));
      }

      if (!isArray(issues)) {
        onIssue(issues)
      }
    }
  }
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
            });
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

function getValidationActions(context): any[] {
  const fileDescriptorsGroups: FileDescriptor[][] =
    getDataPointFileDescriptorsGroups(context.ddfDataSet, context.ddfDataSet.getDataPoint().fileDescriptors);
  const dataPointActions = fileDescriptorsGroups.map(fileDescriptors =>
    context.processRecordBasedRules(fileDescriptors));
  const dataPointTransActions = flattenDeep(
    fileDescriptorsGroups.map(fileDescriptors => {
      const transFileActionsByGroup = [];

      for (let fileDescriptor of fileDescriptors) {
        const translationDescriptors = context.processRecordBasedRules(fileDescriptor.getExistingTranslationDescriptors());

        transFileActionsByGroup.push(translationDescriptors);
      }

      return transFileActionsByGroup;
    }));

  return concat(dataPointActions, dataPointTransActions);
}

export class JSONValidator {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public out: any[];
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;

  constructor(rootPath, settings) {
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
  }

  processRecordBasedRules(fileDescriptors: FileDescriptor[]) {
    return createRecordBasedRulesProcessor(this, fileDescriptors, resultParam => {
      const result = toArray(resultParam);

      if (!isEmpty(result)) {
        this.out = this.out.concat(result.map(issue => issue.view()));
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  multiThreadProcessing() {
    const filesChunks = getDataPointFilesChunks(this.ddfDataSet, cpuCount);

    let childProcessesFinished = 0;

    for (let index = 0; index < cpuCount; index++) {
      const childProcess = child_process.fork(path.resolve(__dirname, 'thread.js'));

      childProcess.on('message', (message) => {
        if (message.finish) {
          childProcessesFinished++;
        }

        this.out = compact(this.out.concat(message.out));

        if (message.finish && childProcessesFinished === cpuCount) {
          this.issueEmitter.emit('finish', message.err, this.out);
        }
      });

      childProcess.send({
        rootPath: this.rootPath,
        settings: this.settings,
        filesChunks: filesChunks[index],
        isCollectResultMode: true
      });
    }
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

      if (this.settings.isMultithread) {
        this.multiThreadProcessing();
      }

      if (!this.settings.isMultithread) {
        const actions = getValidationActions(this);

        parallelLimit(actions, CONCURRENT_OPERATIONS_AMOUNT, err => {
          this.issueEmitter.emit('finish', err, this.out);
        });
      }
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

  processRecordBasedRules(fileDescriptors: FileDescriptor[]) {
    return createRecordBasedRulesProcessor(this, fileDescriptors, resultParam => {
      const result = toArray(resultParam);

      if (!isEmpty(result)) {
        result.map(issue => this.issueEmitter.emit('issue', issue.view()));
      }
    }, () => {
      logger.progress();
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  multiThreadProcessing() {
    const filesChunks = getDataPointFilesChunks(this.ddfDataSet, cpuCount);
    const total = filesChunks.reduce((result, chunk) => result + chunk.length, 0);

    logger.progressInit('datapoints validation', {total});

    let childProcessesFinished = 0;

    for (let index = 0; index < cpuCount; index++) {
      const childProcess = child_process.fork(path.resolve(__dirname, 'thread.js'));

      childProcess.on('message', (message) => {
        if (message.finish) {
          childProcessesFinished++;
        }

        if (message.progress) {
          logger.progress();
        }

        if (!message.finish && message.issue) {
          this.issueEmitter.emit('issue', message.issue);
        }

        if (message.finish && childProcessesFinished === cpuCount) {
          this.issueEmitter.emit('finish', message.err);
        }
      });

      childProcess.send({
        rootPath: this.rootPath,
        settings: this.settings,
        filesChunks: filesChunks[index],
        isCollectResultMode: false
      });
    }
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


      if (this.settings.isMultithread) {
        this.multiThreadProcessing();
      }

      if (!this.settings.isMultithread) {
        const actions = getValidationActions(this);

        logger.progressInit('datapoints validation', {total: actions.length});

        parallelLimit(actions, CONCURRENT_OPERATIONS_AMOUNT, err => {
          this.issueEmitter.emit('finish', err);
        });
      }
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

    if (!this.settings.excludeTags) {
      this.settings.excludeTags = '';
    }

    // SimpleValidator should ignore warnings
    this.settings.excludeTags += ' WARNING ';
  }

  processRecordBasedRules(fileDescriptors: FileDescriptor[]) {
    return createRecordBasedRulesProcessor(this, fileDescriptors, result => {
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
