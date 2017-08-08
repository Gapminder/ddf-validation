import { isArray, isEmpty, sortBy, values } from 'lodash';
import { allRules as ddfRules } from './ddf-rules';
import { FileDescriptor } from './data/file-descriptor';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import { Issue } from './ddf-rules/issue';
import { IssuesFilter } from './utils/issues-filter';
import { DataPointChunksProcessingStory } from './stories/data-point-chunks-processing';

const injectTranslations = (fileDescriptors: FileDescriptor[]) => {
  const translationDescriptors = [];

  for (let fileDescriptor of fileDescriptors) {
    translationDescriptors.push(...fileDescriptor.getExistingTranslationDescriptors());
  }

  fileDescriptors.push(...translationDescriptors);
};

export const CONCURRENT_OPERATIONS_AMOUNT = 30;

export const sameTranslation = (key, fileDescriptor) => fileDescriptor.isTranslation === ddfRules[key].isTranslation;
export const noTranslation = (key, fileDescriptor) => !fileDescriptor.isTranslation && !ddfRules[key].isTranslation;
export const isSimpleRule = ruleObject => !!ruleObject.rule;
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

export const getAllDataPointFileDescriptorsChunks = (ddfDataSet: DdfDataSet): FileDescriptor[][] => {
  const chunks = [];
  const descriptorsGroupsWithSize = getDataPointFileDescriptorsGroups(ddfDataSet, ddfDataSet.getDataPoint().fileDescriptors)
    .map(descriptorsGroup => {
      const size = descriptorsGroup.reduce((sum: number, fileDescriptor: FileDescriptor) =>
        sum + fileDescriptor.size, 0);

      return {descriptorsGroup, size};
    });
  const descriptorsGroupsSortedBySize = sortBy(descriptorsGroupsWithSize, ['size']);

  for (let descriptorPosition = 0;
       descriptorPosition < descriptorsGroupsSortedBySize.length;
       descriptorPosition++) {
    const expectedDescriptorsGroup = descriptorsGroupsSortedBySize[descriptorPosition].descriptorsGroup;

    injectTranslations(expectedDescriptorsGroup);
    chunks.push(expectedDescriptorsGroup);
  }

  return chunks;
};

export const getDataPointFileDescriptorsChunks = (ddfDataSet: DdfDataSet, cpuCount: number): FileDescriptor[][][] => {
  const chunks = [];
  const descriptorsGroupsWithSize = getDataPointFileDescriptorsGroups(ddfDataSet, ddfDataSet.getDataPoint().fileDescriptors)
    .map(descriptorsGroup => {
      const size = descriptorsGroup.reduce((sum: number, fileDescriptor: FileDescriptor) =>
        sum + fileDescriptor.size, 0);

      return {descriptorsGroup, size};
    });
  const descriptorsGroupsSortedBySize = sortBy(descriptorsGroupsWithSize, ['size']);

  for (let index = 0; index < cpuCount; index++) {
    chunks.push([]);
  }

  for (let index = 0; index < descriptorsGroupsSortedBySize.length; index += cpuCount) {
    for (let completeIndex = 0, descriptorPosition = index + completeIndex;
         completeIndex < cpuCount && descriptorPosition < descriptorsGroupsSortedBySize.length;
         completeIndex++, descriptorPosition = index + completeIndex) {
      const expectedDescriptorsGroup = descriptorsGroupsSortedBySize[descriptorPosition].descriptorsGroup;

      injectTranslations(expectedDescriptorsGroup);
      chunks[completeIndex].push(expectedDescriptorsGroup);
    }
  }

  return chunks;
};

export const getDataPointFilesChunks = (ddfDataSet: DdfDataSet, cpuCount: number): string[][][] => {
  const dataPointFileDescriptorsChunks = getDataPointFileDescriptorsChunks(ddfDataSet, cpuCount);

  return dataPointFileDescriptorsChunks.map(chunkForProcess =>
    chunkForProcess.map(dataPointFileDescriptors =>
      dataPointFileDescriptors.map(dataPointFileDescriptor => dataPointFileDescriptor.fullPath)));
};


export const getSimpleRulesResult = (ddfDataSet: DdfDataSet, issuesFilter: IssuesFilter): Issue[] => {
  const rulesKeys = Object.getOwnPropertySymbols(ddfRules).filter(key => isSimpleRule(ddfRules[key]) && issuesFilter.isAllowed(key));
  const allIssuesSources = [];

  for (let key of rulesKeys) {
    const issuesSources = ddfRules[key].rule(ddfDataSet);

    if (!isEmpty(issuesSources)) {
      if (isArray(issuesSources)) {
        allIssuesSources.push(...issuesSources);
      }

      if (!isArray(issuesSources)) {
        allIssuesSources.push(issuesSources);
      }
    }
  }

  return allIssuesSources;
};

export const validationProcess = (context, logger, isCollectResultMode?: boolean) => {
  const simpleRulesResult = getSimpleRulesResult(context.ddfDataSet, context.issuesFilter);
  const allIssuesToOut = [];

  if (!isEmpty(simpleRulesResult)) {
    simpleRulesResult.forEach((issue: Issue) => {
      allIssuesToOut.push(issue.view());

      context.issueEmitter.emit('issue', issue.view());
    });
  }

  if (context.settings.datapointlessMode) {
    context.issueEmitter.emit('finish', null, allIssuesToOut);
  }

  if (!context.settings.datapointlessMode && (context.settings.isMultithread && context.multiThreadProcessing)) {
    context.multiThreadProcessing();
  }

  if (!context.settings.datapointlessMode && (!context.settings.isMultithread || !context.multiThreadProcessing)) {
    const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(context.ddfDataSet);
    const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, context.issueEmitter);
    const theEnd = (out: Issue[] = []) => {
      context.issueEmitter.emit('finish', null, allIssuesToOut.concat(out));
    };

    context.issueEmitter.on('init-chunk-progress', (total: number) => {
      logger.progressInit('datapoints validation', {total});
    });

    context.issueEmitter.on('chunk-progress', () => {
      logger.progress();
    });

    dataPointChunksProcessingStory.waitForResult(theEnd, isCollectResultMode).processDataPointChunks(context.ddfDataSet, context.issuesFilter);
  }
};

export const simpleValidationProcess = (context, logger) => {
  const simpleRulesResult = getSimpleRulesResult(context.ddfDataSet, context.issuesFilter);

  let isDataSetCorrect = true;

  if (!isEmpty(simpleRulesResult)) {
    isDataSetCorrect = false;

    simpleRulesResult.forEach((issue: Issue) => {
      context.issueEmitter.emit('issue', issue.view());
    });
  }

  if (!isDataSetCorrect) {
    context.issueEmitter.emit('finish', null, isDataSetCorrect);
    return;
  }

  const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(context.ddfDataSet);
  const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, context.issueEmitter);
  const theEnd = (out: any[]) => {
    context.issueEmitter.emit('finish', null, isEmpty(out) && isEmpty(simpleRulesResult));
  };

  context.issueEmitter.on('init-chunk-progress', (total: number) => {
    logger.progressInit('datapoints validation', {total});
  });

  context.issueEmitter.on('chunk-progress', () => {
    logger.progress();
  });

  dataPointChunksProcessingStory.waitForResult(theEnd, true).processDataPointChunks(context.ddfDataSet, context.issuesFilter);
};
