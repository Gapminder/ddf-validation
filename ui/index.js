'use strict';

const blessed = require('blessed');

const globals = require('./globals');
const screenConfig = require('./screen-config');
const messageBoxConfig = require('./message-box-config');
const resultBoxConfig = require('./result-box-config');

let screen, box, resultBox, messageBox;

function init() {
  screen = blessed.screen({
    smartCSR: true
  });

  box = blessed.box(screenConfig);

  screen.title = 'DDF validator';
  screen.append(box);

  screen.key(['q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });

  box.focus();
  resultBox = blessed.box(resultBoxConfig(box));
  messageBox = blessed.box(messageBoxConfig(box));
  const tipsBox = blessed.box({
    box,
    content: '{yellow-fg}Q{/yellow-fg} or {yellow-fg}Ctrl-C{/yellow-fg} - exit',
    align: 'center',
    bottom: 0,
    height: 1,
    inputOnFocus: true,
    style: {
      fg: '#ffffff',
      bg: '#0000ff'
    },
    tags: true
  });
  screen.append(tipsBox);
  screen.render();
}

function getNewResults(results) {
  let ret = '';
  for (let result of results) {
    for (let descriptor of globals.ddfValidationResultDescriptors) {
      const operation = descriptor.transform || globals.doNothing;
      const value = operation(result[descriptor.key] || '');

      if (value) {
        ret += descriptor.template.replace('@', value);
      }
    }

    ret += '\n\n';
  }

  return ret;
}

function addResults(results) {
  resultBox.setContent(resultBox.getContent() + getNewResults(results));
  screen.render();
}

function addMessage(message, level) {
  const tags = globals.colorTagByLevel[level];
  messageBox.setContent(`${messageBox.getContent()}\n${tags.start}${message}${tags.finish}`, true);
  screen.render();
}

if (!screen) {
  init();
}

module.exports = {
  addResults,
  addMessage
};
