import { isEmpty, includes } from 'lodash';
import { parallelLimit } from 'async';
import { IssuesFilter } from './utils/issues-filter';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import {
  CONCURRENT_OPERATIONS_AMOUNT,
  toArray,
  createRecordBasedRulesProcessor
} from './shared';

class RecordProcessor {
  public isCollectResultMode: boolean;
  public out: any[];

  constructor(isCollectResultMode: boolean = false) {
    this.isCollectResultMode = isCollectResultMode;
    this.out = [];
  }

  processRecordBasedRules(context: any, dataPointDetail: any): Function {
    return createRecordBasedRulesProcessor(context, dataPointDetail, resultParam => {
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

process.on('message', (message: any) => {
  const recordProcessor = new RecordProcessor(message.isCollectResultMode);
  const threadContext = {
    issuesFilter: new IssuesFilter(message.settings),
    ddfDataSet: new DdfDataSet(message.rootPath, message.settings)
  };

  if (isEmpty(message.fileChunks)) {
    process.send({err: null, out: [], finish: true});
    process.exit();
  }

  threadContext.ddfDataSet.load(() => {
    const validationActions = [];

    for (let fileDescriptor of threadContext.ddfDataSet.getDataPoint().fileDescriptors) {
      if (includes(message.fileChunks, fileDescriptor.fullPath)) {
        validationActions.push(recordProcessor.processRecordBasedRules(threadContext, fileDescriptor));

        for (let transFileDescriptor of fileDescriptor.getExistingTranslationDescriptors()) {
          validationActions.push(recordProcessor.processRecordBasedRules(threadContext, transFileDescriptor));
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
