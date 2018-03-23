import * as path from 'path';
import { EventEmitter } from 'events';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import { IssuesFilter } from './utils/issues-filter';
import {
  validationProcess,
  simpleValidationProcess, getDataPointFilesChunks
} from './shared';
import { logger, getTransport, settings } from './utils';
import * as fs from 'fs';
import { DataPackage, DATA_PACKAGE_FILE } from './data/data-package';

const child_process = require('child_process');
const os = require('os');
const allCpuCount = os.cpus().length;

export class ValidatorBase {
  private messageEmitter: EventEmitter;

  constructor() {
    this.messageEmitter = new EventEmitter();
  }

  public sendMessage(data) {
    this.messageEmitter.emit('message', data);
  }

  public onMessage(data) {
    return this.messageEmitter.on('message', data);
  }
}

export class JSONValidator extends ValidatorBase {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;

  constructor(rootPath, settings) {
    super();
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

export class StreamValidator extends ValidatorBase {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;

  constructor(rootPath, settings) {
    super();
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();

    getTransport().updateSettings(this.settings);
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
    this.sendMessage('loading dataset...');
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);
    this.ddfDataSet.load(() => {
      validationProcess(this, logger);
    });
  }
}

export class SimpleValidator extends ValidatorBase {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;
  public isDataSetCorrect: boolean;

  constructor(rootPath, settings) {
    super();
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

export interface IDataPackageInfo {
  ddfPath: string,
  dataPackagePath: string,
  exists: boolean
}

export function getDataPackageInfo(ddfRootFolder: string): IDataPackageInfo {
  const ddfPath = path.resolve(ddfRootFolder || '.');
  const dataPackagePath = path.resolve(ddfPath, DATA_PACKAGE_FILE);

  return {ddfPath, dataPackagePath, exists: fs.existsSync(dataPackagePath)};
}

export interface IDataPackageCreationParameters {
  ddfRootFolder: string,
  newDataPackagePriority?: boolean,
  externalSettings?
}

export function createDataPackage(parameters: IDataPackageCreationParameters,
                                  onNotice: Function,
                                  onDataPackageReady: Function) {
  const expectedSettings = parameters.externalSettings || settings;

  let {ddfPath, dataPackagePath, exists} = getDataPackageInfo(parameters.ddfRootFolder);
  let newDataPackagePath;

  if (parameters.newDataPackagePriority && exists) {
    const dateLabel = new Date().toISOString().replace(/:/g, '');
    const newFileName = `${DATA_PACKAGE_FILE}.${dateLabel}`;

    newDataPackagePath = path.resolve(ddfPath, newFileName);

    fs.renameSync(dataPackagePath, newDataPackagePath);
  }

  let dataPackageContent = null;

  if (exists) {
    try {
      dataPackageContent = JSON.parse(fs.readFileSync(newDataPackagePath || dataPackagePath, 'utf-8'));
    } catch (err) {
      onNotice(`datapackage.json error: ${err}.`);
      return onDataPackageReady(err);
    }
  }

  const dataPackage = new DataPackage(ddfPath, expectedSettings);

  onNotice('datapackage creation started...');

  dataPackage.build(() => {
    onNotice('resources are ready');

    expectedSettings._newDataPackagePriority = parameters.newDataPackagePriority;

    dataPackage.write(expectedSettings, dataPackageContent, (err: any, filePath: string) => {
      if (err) {
        onNotice(`datapackage.json was NOT created: ${err}.`);
        return onDataPackageReady(err);
      }

      onNotice(`${filePath} was created successfully.`);
      onDataPackageReady();
    });
  });
}

export const validate = validator => validator.validate();
