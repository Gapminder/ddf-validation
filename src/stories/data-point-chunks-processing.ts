import { isArray, isEmpty } from 'lodash';
import { parallelLimit } from 'async';
import { EventEmitter } from 'events';
import { FileDescriptor } from '../data/file-descriptor';
import { DdfDataSet } from '../ddf-definitions/ddf-data-set';
import { Issue } from '../ddf-rules/issue';
import { ProcessOneDataPointsChunkStory } from '../stories/process-one-data-points-chunk';
import { CONCURRENT_OPERATIONS_AMOUNT, supervisor } from '../shared';
import { IssuesFilter } from '../utils/issues-filter';

export class DataPointChunksProcessingStory {
  private fileDescriptorsChunks: FileDescriptor[][];
  private issueEmitter: EventEmitter;
  private processedIssues: number;
  private totalIssues: number;
  private out: any[];
  private customRules: any[];

  constructor(fileDescriptorsChunks: FileDescriptor[][], issueEmitter: EventEmitter) {
    this.fileDescriptorsChunks = fileDescriptorsChunks;
    this.issueEmitter = issueEmitter;
  }

  withCustomRules(customRules: any[]): DataPointChunksProcessingStory {
    this.customRules = customRules;

    return this;
  }

  processDataPointChunks(ddfDataSet: DdfDataSet, issuesFilter: IssuesFilter) {
    this.processedIssues = this.totalIssues = 0;

    const actions = this.fileDescriptorsChunks.map(fileDescriptors => onFileCompleteProcessed => {
      const dataPointsCheckingStory = new ProcessOneDataPointsChunkStory(fileDescriptors, this.issueEmitter);

      dataPointsCheckingStory.withCustomRules(this.customRules).collect(ddfDataSet, issuesFilter, () => {
        dataPointsCheckingStory.analyze();

        this.issueEmitter.emit('chunk-progress');

        onFileCompleteProcessed(
          supervisor.abandon ? new Error('abandoned by the external reason') : null,
          dataPointsCheckingStory.getTotal()
        );
      });
    });

    this.issueEmitter.emit('init-chunk-progress', actions.length);

    parallelLimit(actions, CONCURRENT_OPERATIONS_AMOUNT, (err, results) => {
      const totalIssues = <number>results.reduce((sum: number, value: number) => sum + value, 0);

      this.issueEmitter.emit('total-issues', totalIssues);
    });
  }

  waitForResult(onDataPointChunksProcessed: Function, isCollectResultMode?: boolean) {
    this.out = [];
    this.issueEmitter.on('issues-sources', (issuesSources: Issue[] | Issue) => {
      if (!isEmpty(issuesSources)) {
        const issuesToOut = isArray(issuesSources) ? issuesSources : [issuesSources];

        issuesToOut.forEach(issue => {
          if (isCollectResultMode) {
            this.out.push(issue.view());
          }

          this.issueEmitter.emit('issue', issue.view());
        });
      }

      this.processedIssues++;
      this.done(onDataPointChunksProcessed);
    });

    this.issueEmitter.on('total-issues', (totalIssues: number) => {
      this.totalIssues = totalIssues;
      this.done(onDataPointChunksProcessed);
    });

    return this;
  }

  done(onDataPointChunksProcessed: Function) {
    if (this.processedIssues === this.totalIssues) {
      onDataPointChunksProcessed(this.out);
    }
  }
}
