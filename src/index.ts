import * as path from 'path';
import { EventEmitter } from 'events';
import { DdfDataSet } from './ddf-definitions/ddf-data-set';
import { IssuesFilter } from './utils/issues-filter';
import {
  supervisor,
  validationProcess,
  simpleValidationProcess,
  getDataPointFilesChunks
} from './shared';
import { logger, getTransport, settings } from './utils';
import * as fs from 'fs';
import { DataPackage, DATA_PACKAGE_FILE } from './data/data-package';
import { allRules } from './ddf-rules';

const child_process = require('child_process');
const os = require('os');
const allCpuCount = os.cpus().length;

const resetGlobals = () => {
  Object.getOwnPropertySymbols(allRules).forEach(dataPointRuleKey => {
    if (allRules[dataPointRuleKey].resetStorage) {
      allRules[dataPointRuleKey].resetStorage();
    }
  });
};

function mapToObject(map: Map<string, number>) {
  return Array.from(map.keys()).reduce((agg, key) => {
    agg[key] = map.get(key);

    return agg;
  }, {});
}

export interface IDdfValidationSummary {
  errors: number,
  warnings: number,
  errorsByFiles: { [file: string]: number },
  errorsByRuleId: { [ruleId: string]: number },
  warningsByFiles: { [file: string]: number },
  warningsByRuleId: { [ruleId: string]: number }
}

export class ValidatorBase {
  protected messageEmitter: EventEmitter;

  constructor() {
    this.messageEmitter = new EventEmitter();
  }

  public sendMessage(data) {
    this.messageEmitter.emit('message', data);
  }

  public onMessage(data) {
    return this.messageEmitter.on('message', data);
  }

  public abandon() {
    supervisor.abandon = true;
    this.messageEmitter.emit('abandon', true);
  }

  public isAbandoned(): boolean {
    return supervisor.abandon
  }
}

export class JSONValidator extends ValidatorBase {
  public rootPath: string;
  public settings: any;
  public issueEmitter: EventEmitter;
  public issuesFilter: IssuesFilter;
  public ddfDataSet: DdfDataSet;
  public summary: IDdfValidationSummary;

  private errorsSummaryByFileHash = new Map<string, number>();
  private errorsSummaryByRuleHash = new Map<string, number>();
  private warningsSummaryByFileHash = new Map<string, number>();
  private warningsSummaryByRuleHash = new Map<string, number>();

  constructor(rootPath, settings) {
    super();
    this.rootPath = rootPath;
    this.settings = settings || {};
    this.issueEmitter = new EventEmitter();
    this.issueEmitter.on('issue', issue => {
      this.fillSummary(issue);
    });
    this.issueEmitter.on('finish', error => {
      if (!error) {
        this.summary.errorsByFiles = mapToObject(this.errorsSummaryByFileHash);
        this.summary.errorsByRuleId = mapToObject(this.errorsSummaryByRuleHash);
        this.summary.warningsByFiles = mapToObject(this.warningsSummaryByFileHash);
        this.summary.warningsByRuleId = mapToObject(this.warningsSummaryByRuleHash);
      }
    });
  }

  on(type, data) {
    return this.issueEmitter.on(type, data);
  }

  validate() {
    this.initSummary();
    this.issuesFilter = new IssuesFilter(this.settings);
    this.ddfDataSet = new DdfDataSet(this.rootPath, this.settings);

    this.ddfDataSet.load(() => {
      validationProcess(this, logger, true);
    });
  }

  private initSummary() {
    this.summary = {
      errors: 0,
      warnings: 0,
      errorsByFiles: {},
      errorsByRuleId: {},
      warningsByFiles: {},
      warningsByRuleId: {}
    };
    this.errorsSummaryByFileHash.clear();
    this.errorsSummaryByRuleHash.clear();
    this.warningsSummaryByFileHash.clear();
    this.warningsSummaryByRuleHash.clear();
  }

  private fillSummary(issue) {
    const file = issue.path ? path.relative(this.rootPath, issue.path) : 'not related to file';

    if (issue.isWarning) {
      if (!this.errorsSummaryByFileHash.has[file]) {
        this.errorsSummaryByFileHash.set(file, 0);
      }

      this.errorsSummaryByFileHash.set(file, this.errorsSummaryByFileHash.get(file) + 1);

      if (!this.errorsSummaryByRuleHash.has(issue.id)) {
        this.errorsSummaryByRuleHash.set(issue.id, 0);
      }

      this.errorsSummaryByRuleHash.set(issue.id, this.errorsSummaryByRuleHash.get(issue) + 1);
      this.summary.errors++;
    } else {
      if (!this.warningsSummaryByFileHash.has(file)) {
        this.warningsSummaryByFileHash.set(file, 0);
      }

      this.warningsSummaryByFileHash.set(file, this.warningsSummaryByFileHash.get(file) + 1);

      if (!this.warningsSummaryByRuleHash.has(issue.id)) {
        this.warningsSummaryByRuleHash.set(issue.id, 0);
      }

      this.warningsSummaryByRuleHash.set(issue.id, this.warningsSummaryByRuleHash.get(issue.id) + 1);
      this.summary.warnings++;
    }
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
    const childProcesses = [];

    logger.progressInit('datapoints validation', {total});

    let childProcessesFinished = 0;

    for (let index = 0; index < cpuCount; index++) {
      const childProcess = child_process.fork(path.resolve(this.settings.appPath || __dirname, 'thread.js'));

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

      childProcesses.push(childProcess);
    }

    this.messageEmitter.on('abandon', () => {
      for (const childProcess of childProcesses) {
        try {
          childProcess.send('abandon');
        } catch (e) {
        }
      }
    });
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
      return onDataPackageReady(`datapackage.json error: ${err}.`);
    }
  }

  const dataPackage = new DataPackage(ddfPath, expectedSettings);

  onNotice('datapackage creation started...');

  dataPackage.build(() => {
    onNotice('resources are ready');

    expectedSettings._newDataPackagePriority = parameters.newDataPackagePriority;

    dataPackage.write(expectedSettings, dataPackageContent, (err: any, filePath: string) => {
      if (err) {
        return onDataPackageReady(`datapackage.json was NOT created: ${err}.`);
      }

      onNotice(`${filePath} was created successfully.`);
      onDataPackageReady();
    });
  });
}

export const validate = validator => {
  supervisor.abandon = false;
  resetGlobals();
  validator.validate()
};
