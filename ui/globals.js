'use strict';

const prettyjson = require('prettyjson');

exports.NOTICE = Symbol('notice');
exports.ERROR = Symbol('error');
exports.WARNING = Symbol('warning');

exports.colorTagByLevel = {
  [exports.NOTICE]: {
    start: '{white-fg}',
    finish: '{/white-fg}'
  },
  [exports.ERROR]: {
    start: '{red-fg}',
    finish: '{/red-fg}'
  },
  [exports.WARNING]: {
    start: '{yellow-fg}',
    finish: '{/yellow-fg}'
  }
};

exports.doNothing = value => value;
exports.ddfValidationResultDescriptors = [
  {
    key: 'folderPath',
    template: '{yellow-fg}path: {/yellow-fg}@\n'
  },
  {
    key: 'fileName',
    template: '{yellow-fg}file: {/yellow-fg}@\n'
  },
  {
    key: 'entry',
    template: '{yellow-fg}entry: {/yellow-fg}@\n',
    transform: value => value ? JSON.stringify(value) : ''
  },
  {
    key: 'errors',
    template: '{red-fg}errors: {/red-fg}@\n',
    transform: value => {
      let result = '';

      if (typeof value === 'string' && value.length > 0) {
        result = prettyjson.render(JSON.parse(value));
      }

      if (typeof value === 'object') {
        result = prettyjson.render(value);
      }

      return result;
    }
  },
  {
    key: 'warning',
    template: '{red-fg}warning: {/red-fg}@\n'
  },
  {
    key: 'valid',
    template: '{blue-fg}valid: {/blue-fg}@\n',
    transform: value => value === true ? '{green-fg}Yes{/green-fg}' : '{red-fg}No{/red-fg}'
  }
];
