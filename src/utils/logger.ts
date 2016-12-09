import {Logger, Transport} from 'winston';

const util = require('util');
const CONSOLE_MODE = Symbol.for('CONSOLE_MODE');
const UI_MODE = Symbol.for('UI_MODE');
const profiles = {
  [CONSOLE_MODE]: class {
    notice(level: any, msg: any, meta: any, callback: Function) {
      console.log(msg);
      callback(null, true);
    }
  }
};

export const getLogger = () => {
  const mode = CONSOLE_MODE;

  class CustomTransport extends Transport {
    public name: string;
    public level: string;

    constructor() {
      super();

      this.name = 'CustomTransport';
      this.level = 'error';
    }

    log(level: any, msg: any, meta: any, callback: Function) {
      const expectedProfile = new profiles[mode]();

      expectedProfile.notice(level, msg, meta, callback);
    }
  }

  const customTransport = new CustomTransport();
  const options: any = {
    levels: {trace: 0, results: 1, notice: 2, warning: 3, error: 4},
    transports: [
      customTransport
    ]
  };

  return new Logger(options);
};
