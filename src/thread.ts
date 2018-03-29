import { isEmpty, includes } from 'lodash';
import { EventEmitter } from 'events';
import { IssuesFilter } from './utils/issues-filter';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import { getAllDataPointFileDescriptorsChunks } from './shared';
import { FileDescriptor } from './data/file-descriptor';
import { Issue } from "./ddf-rules/issue";
import { DataPointChunksProcessingStory } from './stories/data-point-chunks-processing';

const isExistInFilesChunks = (filesChunks: string[][], fileDescriptors: FileDescriptor[]): boolean => {
  for (let chunk of filesChunks) {
    for (let fileDescriptor of fileDescriptors) {
      if (includes(chunk, fileDescriptor.fullPath)) {
        return true;
      }
    }
  }

  return false;
};

process.on('message', (message: any) => {
  const ddfDataSet = new DdfDataSet(message.rootPath, message.settings);
  const issuesFilter = new IssuesFilter(message.settings);
  const threadContext = {issuesFilter, ddfDataSet};
  const issueEmitter = new EventEmitter();
  const out = [];

  if (isEmpty(message.filesChunks) || message === 'abandon') {
    process.send({err: null, out: [], finish: true});
    process.exit();
  }

  threadContext.ddfDataSet.load(() => {
    const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
    const expectedFileDescriptorsChunks = [];

    for (let fileDescriptors of fileDescriptorsChunks) {
      if (isExistInFilesChunks(message.filesChunks, fileDescriptors)) {
        expectedFileDescriptorsChunks.push(fileDescriptors);
      }
    }

    const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(expectedFileDescriptorsChunks, issueEmitter);
    const theEnd = () => {
      process.send({out, finish: true});
      process.exit();
    };

    issueEmitter.on('chunk-progress', () => {
      process.send({progress: true});
    });

    issueEmitter.on('issue', (issue: Issue) => {
      if (issue) {
        if (!message.isCollectResultMode) {
          process.send({issue});
        }

        if (message.isCollectResultMode) {
          out.push(issue);
        }
      }
    });

    dataPointChunksProcessingStory.waitForResult(theEnd, message.isCollectResultMode).processDataPointChunks(ddfDataSet, issuesFilter);
  });
});
