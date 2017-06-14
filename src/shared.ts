import { compact, isArray, sortBy } from 'lodash';
import { allRules as ddfRules } from './ddf-rules';
import { FileDescriptor } from './data/file-descriptor';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';

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
          ddfRules[key].aggregateRecord({ddfDataSet, fileDescriptor, record, line});
        }
      });
  };
}

function processAggregation(context, ddfDataSet, fileDescriptor, resultHandler) {
  Object.getOwnPropertySymbols(ddfRules)
    .filter(ruleKey => sameTranslation(ruleKey, fileDescriptor) || noTranslation(ruleKey, fileDescriptor))
    .filter(ruleKey => isAggregativeRule(ddfRules[ruleKey]))
    .filter(ruleKey => context.issuesFilter.isAllowed(ruleKey))
    .forEach(ruleKey => {
      resultHandler(ddfRules[ruleKey].aggregativeRule({ddfDataSet, fileDescriptor}, ruleKey));
    });
}

export const CONCURRENT_OPERATIONS_AMOUNT = 30;
export const isSimpleRule = ruleObject => !!ruleObject.rule;
export const isRecordRule = ruleObject => !!ruleObject.recordRule;
export const isAggregativeRule = ruleObject => !!ruleObject.aggregateRecord && !!ruleObject.aggregativeRule;
export const sameTranslation = (key, fileDescriptor) => fileDescriptor.isTranslation === ddfRules[key].isTranslation;
export const noTranslation = (key, fileDescriptor) => !fileDescriptor.isTranslation && !ddfRules[key].isTranslation;
export const toArray = value => compact(isArray(value) ? value : [value]);
export const getDataPointFileChunks = (ddfDataSet: DdfDataSet, cpuCount: number): string[] => {
  const fileChunks = [];
  const filesSortedBySize = sortBy(ddfDataSet.getDataPoint().fileDescriptors, ['size'])
    .map((fileDescriptor: FileDescriptor) => fileDescriptor.fullPath);

  for (let index = 0; index < cpuCount; index++) {
    fileChunks.push([]);
  }

  for (let index = 0; index < filesSortedBySize.length;) {
    for (let completeIndex = 0; completeIndex < cpuCount && index + completeIndex < filesSortedBySize.length; completeIndex++) {
      fileChunks[completeIndex].push(filesSortedBySize[index + completeIndex]);
    }

    index += cpuCount;
  }

  return fileChunks;
};

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
