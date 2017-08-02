import { isEmpty, includes } from 'lodash';
import { parallelLimit } from 'async';
import { IssuesFilter } from './utils/issues-filter';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import {
  CONCURRENT_OPERATIONS_AMOUNT,
  toArray,
  createRecordBasedRulesProcessor,
  getDataPointFileDescriptorsGroups
} from './shared';
import { FileDescriptor } from './data/file-descriptor';

class RecordProcessor {
  public isCollectResultMode: boolean;
  public out: any[];

  constructor(isCollectResultMode: boolean = false) {
    this.isCollectResultMode = isCollectResultMode;
    this.out = [];
  }

  processRecordBasedRules(context: any, fileDescriptors: FileDescriptor[]): Function {
    return createRecordBasedRulesProcessor(context, fileDescriptors, resultParam => {
      const result = toArray(resultParam);

      if (!isEmpty(result)) {
        result.forEach(issue => {
          if (issue) {

            if (!this.isCollectResultMode) {
              process.send({issue: JSON.stringify(issue.view(), null, 2)});
            }

            if (this.isCollectResultMode) {
              this.out = this.out.concat(result.map(issue => issue.view()));
            }
          }
        });
      }
    }, () => {
      process.send({progress: true});
    });
  }
}

const isExistInFilesChunks = (filesChunks: string[][], fileDescriptorsGroup: FileDescriptor[]): boolean => {
  for (let chunk of filesChunks) {
    for (let fileDescriptor of fileDescriptorsGroup) {
      if (includes(chunk, fileDescriptor.fullPath)) {
        return true;
      }
    }
  }

  return false;
};

process.on('message', (message: any) => {
  const recordProcessor = new RecordProcessor(message.isCollectResultMode);
  const ddfDataSet = new DdfDataSet(message.rootPath, message.settings);
  const threadContext = {issuesFilter: new IssuesFilter(message.settings), ddfDataSet};

  if (isEmpty(message.filesChunks)) {
    process.send({err: null, out: [], finish: true});
    process.exit();
  }

  threadContext.ddfDataSet.load(() => {
    const validationActions = [];
    const fileDescriptors = threadContext.ddfDataSet.getDataPoint().fileDescriptors;
    const fileDescriptorsGroups = getDataPointFileDescriptorsGroups(ddfDataSet, fileDescriptors);

    for (let fileDescriptors of fileDescriptorsGroups) {
      if (isExistInFilesChunks(message.filesChunks, fileDescriptors)) {
        validationActions.push(recordProcessor.processRecordBasedRules(threadContext, fileDescriptors));

        for (let fileDescriptor of fileDescriptors) {
          validationActions.push(recordProcessor.processRecordBasedRules(threadContext, fileDescriptor.getExistingTranslationDescriptors()));
        }
      }
    }

    parallelLimit(validationActions, CONCURRENT_OPERATIONS_AMOUNT, (err: any) => {
      const out = message.isCollectResultMode ? recordProcessor.out : null;

      process.send({err, out, finish: true});
      process.exit();
    });
  });
});
