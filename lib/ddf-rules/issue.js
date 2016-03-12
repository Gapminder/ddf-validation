'use strict';

const registry = require('./registry');

class Issue {
  constructor(type, path, data) {
    this.type = type;
    this.path = path;
    this.data = data;
    this.suggestions = [];
  }

  view() {
    const result = {
      type: registry.descriptions[this.type],
      path: this.path,
      data: this.data
    };

    if (this.suggestions && this.suggestions.length > 0) {
      result.suggestions = this.suggestions;
    }

    if (this.isWarning === true) {
      result.warning = true;
    }

    return result;
  }

  warning() {
    this.isWarning = true;

    return this;
  }
}

module.exports = Issue;
