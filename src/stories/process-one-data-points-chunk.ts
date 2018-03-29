import { isEmpty } from 'lodash';
import { parallelLimit } from 'async';
import { EventEmitter } from 'events';
import { allRules as ddfRules } from '../ddf-rules';
import { FileDescriptor } from '../data/file-descriptor';
import { DdfDataSet } from '../ddf-definitions/ddf-data-set';
import { walkFile } from '../utils/file';
import { CONCURRENT_OPERATIONS_AMOUNT, noTranslation, sameTranslation, supervisor } from '../shared';
import { IssuesFilter } from '../utils/issues-filter';

export const isRecordRule = ruleObject => !!ruleObject.recordRule;
export const isAggregativeRule = ruleObject => !!ruleObject.aggregateRecord && !!ruleObject.aggregativeRule;

export class ProcessOneDataPointsChunkStory {
  private fileDescriptors: FileDescriptor[];
  private issueEmitter: EventEmitter;
  private sent: number;
  private rulesWrappers: any[];
  private customRules: any[];

  constructor(fileDescriptors: FileDescriptor[], issueEmitter: EventEmitter) {
    this.fileDescriptors = fileDescriptors;
    this.issueEmitter = issueEmitter;
    this.sent = 0;
  }

  withCustomRules(customRules?: any[]): ProcessOneDataPointsChunkStory {
    if (!isEmpty(customRules)) {
      this.customRules = customRules;
    }

    return this;
  }

  collect(ddfDataSet: DdfDataSet, issuesFilter: IssuesFilter, onDataCollected) {
    this.rulesWrappers = this.getRuleWrappers(issuesFilter);

    const actions: any = this.fileDescriptors.map((fileDescriptor: FileDescriptor) => (onFileDescriptorProcessed: Function) => {
      walkFile(fileDescriptor.fullPath, (record, line) => {
        if (supervisor.abandon) {
          return onFileDescriptorProcessed(new Error('abandoned by the external reason'));
        }

        for (let ruleWrapper of this.rulesWrappers) {
          if (supervisor.abandon) {
            return onFileDescriptorProcessed(new Error('abandoned by the external reason'));
          }

          if (sameTranslation(ruleWrapper.ruleKey, fileDescriptor) || noTranslation(ruleWrapper.ruleKey, fileDescriptor)) {
            if (isRecordRule(ruleWrapper.rule)) {
              const issues = ruleWrapper.rule.recordRule({ddfDataSet, fileDescriptor, record, line});

              this.issueEmitter.emit('issues-sources', issues);
              this.sent++
            }

            if (isAggregativeRule(ruleWrapper.rule)) {
              ruleWrapper.rule.aggregateRecord({ddfDataSet, fileDescriptor, record, line}, ruleWrapper.storage);
            }
          }
        }
      }, onFileDescriptorProcessed);
    });

    parallelLimit(actions, CONCURRENT_OPERATIONS_AMOUNT, onDataCollected);
  }

  analyze() {
    for (let ruleWrapper of this.rulesWrappers) {
      if (supervisor.abandon) {
        return;
      }

      if (isAggregativeRule(ruleWrapper.rule)) {
        const issues = ruleWrapper.rule.aggregativeRule(ruleWrapper.storage);

        if (!isEmpty(issues)) {
          this.issueEmitter.emit('issues-sources', issues);
          this.sent++;
        }

        ruleWrapper.storage = null;
      }
    }
  }

  getTotal() {
    return this.sent;
  }

  private getRuleWrappers(issuesFilter: IssuesFilter): any {
    let result: any[] = null;

    if (!this.customRules) {
      result = Object.getOwnPropertySymbols(ddfRules)
        .filter(ruleKey => (isAggregativeRule(ddfRules[ruleKey]) || isRecordRule(ddfRules[ruleKey])) && issuesFilter.isAllowed(ruleKey))
        .map(ruleKey => ({
          ruleKey,
          rule: ddfRules[ruleKey],
          storage: ddfRules[ruleKey].getStorageTemplate ? ddfRules[ruleKey].getStorageTemplate() : {}
        }));
    }

    if (this.customRules) {
      result = this.customRules.map(customRule => ({
        ruleKey: customRule.ruleKey,
        rule: customRule.rule,
        storage: customRule.rule.getStorageTemplate ? customRule.rule.getStorageTemplate() : {}
      }));
    }

    return result;
  }
}
