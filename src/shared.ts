import { compact, isArray, sortBy, values } from 'lodash';
import { parallelLimit } from 'async';
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

function clearAggregationCache(context, fileDescriptor) {
  Object.getOwnPropertySymbols(ddfRules)
    .filter(ruleKey => sameTranslation(ruleKey, fileDescriptor) || noTranslation(ruleKey, fileDescriptor))
    .filter(ruleKey => isAggregativeRule(ddfRules[ruleKey]))
    .filter(ruleKey => context.issuesFilter.isAllowed(ruleKey))
    .forEach(ruleKey => {
      ddfRules[ruleKey].resetStorage();
    });
}

export const CONCURRENT_OPERATIONS_AMOUNT = 30;
export const isSimpleRule = ruleObject => !!ruleObject.rule;
export const isRecordRule = ruleObject => !!ruleObject.recordRule;
export const isAggregativeRule = ruleObject => !!ruleObject.aggregateRecord && !!ruleObject.aggregativeRule;
export const sameTranslation = (key, fileDescriptor) => fileDescriptor.isTranslation === ddfRules[key].isTranslation;
export const noTranslation = (key, fileDescriptor) => !fileDescriptor.isTranslation && !ddfRules[key].isTranslation;
export const toArray = value => compact(isArray(value) ? value : [value]);
export const getDataPointFileDescriptorsGroups = (ddfDataSet: DdfDataSet, fileDescriptors: FileDescriptor[]): FileDescriptor[][] => {
  const dataPointsGroups = {};
  const resources = ddfDataSet.getDataPackageDescriptor().dataPackageContent.resources;
  const fileDescriptorsHash = fileDescriptors.reduce((hash, fileDescriptor: FileDescriptor) => {
    hash[fileDescriptor.file] = fileDescriptor;

    return hash;
  }, {});

  for (let resource of resources) {
    if (isArray(resource.schema.primaryKey)) {
      const fields = resource.schema.fields.map(field => {
        let constraint = '';

        if (field.constraints && field.constraints.enum) {
          constraint = '@' + field.constraints.enum.sort().join('-');
        }

        return field.name + constraint;
      });
      const key = fields.sort().join('--');

      if (!dataPointsGroups[key]) {
        dataPointsGroups[key] = [];
      }

      dataPointsGroups[key].push(fileDescriptorsHash[resource.path]);
    }
  }

  return <FileDescriptor[][]>values(dataPointsGroups);
};
export const getDataPointFilesChunks = (ddfDataSet: DdfDataSet, cpuCount: number): string[] => {
  const filesChunks = [];
  const descriptorsGroupsWithSize = getDataPointFileDescriptorsGroups(ddfDataSet, ddfDataSet.getDataPoint().fileDescriptors)
    .map(descriptorsGroup => {
      const size = descriptorsGroup.reduce((sum: number, fileDescriptor: FileDescriptor) =>
        sum + fileDescriptor.size, 0);

      return {descriptorsGroup, size};
    });
  const descriptorsGroupsSortedBySize = sortBy(descriptorsGroupsWithSize, ['size']);

  for (let index = 0; index < cpuCount; index++) {
    filesChunks.push([]);
  }

  for (let index = 0; index < descriptorsGroupsSortedBySize.length; index += cpuCount) {
    for (let completeIndex = 0, descriptorPosition = index + completeIndex;
         completeIndex < cpuCount && descriptorPosition < descriptorsGroupsSortedBySize.length;
         completeIndex++, descriptorPosition = index + completeIndex) {
      const expectedDescriptorsGroup = descriptorsGroupsSortedBySize[descriptorPosition].descriptorsGroup;
      const expectedFiles = expectedDescriptorsGroup.map(fileDescriptor => fileDescriptor.fullPath);

      filesChunks[completeIndex].push(expectedFiles);
    }
  }

  return filesChunks;
};

export function createRecordBasedRulesProcessor(context,
                                                fileDescriptors: FileDescriptor[],
                                                resultHandler: Function,
                                                progressHandler?: Function) {
  const ddfDataSet = context.ddfDataSet;

  return onDataPointReady => {
    const actions = fileDescriptors.map(fileDescriptor => onFileDescriptorReady => {
      context.ddfDataSet.getDataPoint().loadFile(
        fileDescriptor,
        createRecordAggregationProcessor(context, ddfDataSet, fileDescriptor, resultHandler),
        () => {
          processAggregation(context, ddfDataSet, fileDescriptor, resultHandler);

          onFileDescriptorReady();
        }
      );
    });

    parallelLimit(actions, 10, () => {
      if (progressHandler) {
        progressHandler();
      }

      fileDescriptors.forEach(fileDescriptor => {
        clearAggregationCache(context, fileDescriptor)
      });

      onDataPointReady();
    });
  };
}
