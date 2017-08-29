import * as path from 'path';
import { EventEmitter } from 'events';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import { IssuesFilter } from './utils/issues-filter';
import {
  validationProcess,
  simpleValidationProcess, getDataPointFilesChunks
} from './shared';
import { logger, getTransport } from './utils';

const child_process = require('child_process');
const os = require('os');
const allCpuCount = os.cpus().length;

export class JSONValidator {
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

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    this.ddfDataSet.load(() => {
      validationProcess(this, logger, true);
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

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  multiThreadProcessing() {
    const cpuCount = allCpuCount - (this.settings.useAllCpu ? 0 : 1);
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
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    this.ddfDataSet.load(() => {
      validationProcess(this, logger);
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

    // SimpleValidator should ignore warnings and in silent mode
    this.settings.excludeTags += ' WARNING ';
    this.settings.silent = true;

    getTransport().updateSettings(this.settings);
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    this.ddfDataSet.load(() => {
      simpleValidationProcess(this);
    });
  }
}

export const validate = validator => validator.validate();
