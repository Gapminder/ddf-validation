import { isArray, isEmpty, includes, sortBy, values, compact } from 'lodash';
import { allRules as ddfRules } from './ddf-rules';
import { FileDescriptor } from './data/file-descriptor';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import { Issue } from './ddf-rules/issue';
import { IssuesFilter } from './utils/issues-filter';
import { DataPointChunksProcessingStory } from './stories/data-point-chunks-processing';
import { DATAPACKAGE_TAG, tags } from './ddf-rules/registry';
import { DATA_POINT, getTypeByPrimaryKey } from './ddf-definitions/constants';

export const supervisor = {
  abandon: false
};

const getValidationSyncResultBySimpleRules = (ddfDataSet: DdfDataSet, rulesKeys): Issue[] => {
  const allIssuesSources = [];

  for (let key of rulesKeys) {
    if (supervisor.abandon) {
      return null;
    }

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
  const resources = ddfDataSet.getDataPackageResources();
  const fileDescriptorsHash = fileDescriptors.reduce((hash, fileDescriptor: FileDescriptor) => {
    hash[fileDescriptor.file] = fileDescriptor;

    return hash;
  }, {});

  for (let resource of resources) {
    if (getTypeByPrimaryKey(resource.schema.primaryKey) === DATA_POINT) {
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

  return <FileDescriptor[][]>compact(values(dataPointsGroups));
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

  return getValidationSyncResultBySimpleRules(ddfDataSet, rulesKeys);
};

export const getPreResult = (ddfDataSet: DdfDataSet, issuesFilter: IssuesFilter): Issue[] => {
  const rulesKeys = Object.getOwnPropertySymbols(ddfRules)
    .filter(key => includes(tags[key], DATAPACKAGE_TAG) && issuesFilter.isAllowed(key));

  return getValidationSyncResultBySimpleRules(ddfDataSet, rulesKeys);
};

export const validationProcess = (context, logger, isCollectResultMode?: boolean) => {
  context.sendMessage('validating concepts and entities...');
  const preRulesResult = getPreResult(context.ddfDataSet, context.issuesFilter);

  if (!isEmpty(preRulesResult)) {
    const preIssuesToOut = [];

    preRulesResult.forEach((issue: Issue) => {
      preIssuesToOut.push(issue.view());

      context.issueEmitter.emit('issue', issue.view());
    });

    context.issueEmitter.emit('finish', null, preIssuesToOut);
  } else {
    const simpleRulesResult = getSimpleRulesResult(context.ddfDataSet, context.issuesFilter);
    const allIssuesToOut = [];

    if (supervisor.abandon) {
      context.issueEmitter.emit('finish');
      return;
    }

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
        context.sendMessage('validating datapoints...');
        logger.progressInit('datapoints validation', {total});
      });

      context.issueEmitter.on('chunk-progress', () => {
        if (supervisor.abandon) {
          context.issueEmitter.emit('finish');
          return;
        }

        logger.progress();
      });

      dataPointChunksProcessingStory.waitForResult(theEnd, isCollectResultMode).processDataPointChunks(context.ddfDataSet, context.issuesFilter);
    }
  }
};

export const simpleValidationProcess = (context) => {
  const preRulesResult = getPreResult(context.ddfDataSet, context.issuesFilter);

  if (!isEmpty(preRulesResult)) {
    context.issueEmitter.emit('finish', null, false);
  } else {
    const simpleRulesResult = getSimpleRulesResult(context.ddfDataSet, context.issuesFilter);

    let isDataSetCorrect = true;

    if (!isEmpty(simpleRulesResult)) {
      context.issueEmitter.emit('finish', null, false);
    } else {
      if (context.settings.datapointlessMode) {
        context.issueEmitter.emit('finish', null, isDataSetCorrect);
      }

      if (!context.settings.datapointlessMode) {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(context.ddfDataSet);
        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, context.issueEmitter);
        const theEnd = (out: Issue[] = []) => {
          context.issueEmitter.emit('finish', null, isDataSetCorrect && isEmpty(out));
        };

        dataPointChunksProcessingStory.waitForResult(theEnd, true).processDataPointChunks(context.ddfDataSet, context.issuesFilter);
      }
    }
  }
};
