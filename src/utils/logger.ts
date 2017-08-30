import * as fs from 'fs';
import { includes } from 'lodash';
import { Logger, Transport } from 'winston';
import { terminal as term } from 'terminal-kit';
import { getSettings } from '../utils/args';

const settings = getSettings();

const args = process.argv.join(' ');
const isSeparateThread = includes(args, 'thread.js');

export class Progress {
  public title: string;
  public isEnabled: boolean;
  public progressBar;
  public step: number;
  public progressValue: number;

  constructor(title: string, totalSteps: number) {
    this.title = title;
    this.isEnabled = +totalSteps > 1 && !isSeparateThread;

    if (this.isEnabled) {
      this.step = (100 / (+totalSteps)) / 100;
      this.progressValue = 0;
      this.progressBar = term.progressBar({
        title: title,
        percent: true,
        inline: false,
        syncMode: true
      });
    }

    if (!this.isEnabled && this.progressBar) {
      try {

      } catch (e) {
        this.resume();
      }
    }
  }

  update() {
    if (this.isEnabled) {
      try {
        this.progressValue += this.step;
        this.progressBar.update(this.progressValue);
      } catch (e) {
      }
    }
  }

  resume() {
    if (this.progressBar) {
      try {
        this.progressBar.stop();
      } catch (e) {

      }
    }
  }
}

export class ValidationTransport extends Transport {
  public name: string;
  public level: string;
  public progress: Progress;
  public file: string;

  constructor() {
    super();

    this.name = 'InfoTransport';
    this.level = 'notice';

    if (!settings.silent && !process.env.SILENT_MODE) {
      const dateLabel = new Date().toISOString().replace(/:/g, '');

      this.file = `validation-${dateLabel}.log`;
    }
  }

  updateSettings(newSettings: any) {
    const newSettingsKeys = Object.keys(newSettings);

    for (let key of newSettingsKeys) {
      settings[key] = newSettings[key];
    }
  }

  log(level: string, msg: string, meta: any, callback: Function) {
    if (level === 'progressInit' && !settings.silent && !process.env.SILENT_MODE) {
      if (this.progress) {
        this.progress.resume();
      }

      this.progress = new Progress(msg, meta.total as number);
    }

    if (level === 'progress' && !settings.silent && !process.env.SILENT_MODE) {
      this.progress.update();
    }

    if (level === 'notice') {
      if (settings.silent) {
        console.log(msg);
      }

      if (!settings.silent && !process.env.SILENT_MODE) {
        fs.appendFile(this.file, msg, (err) => {
          if (err) {
            return callback(err)
          }

          callback(null, true);
        });
      }
    }
  }
}

export const validationTransport = new ValidationTransport();


let logger;

export const getLogger: Function = () => {
  if (!logger) {
    logger = new Logger({
      levels: {
        trace: 0,
        progressInit: 1,
        progress: 2,
        notice: 3,
        warning: 4,
        error: 5
      },
      level: 'notice',
      transports: [
        validationTransport
      ]
    });
  }

  return logger;
};

export const getTransport = () => validationTransport;
