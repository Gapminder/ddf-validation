'use strict';

const registry = require('./registry');

class Issue {
  constructor(type) {
    this.type = type;
    this.suggestions = [];
  }

  fillPath(path) {
    this.path = path;

    return this;
  }

  fillData(data) {
    this.data = data;

    return this;
  }

  fillSuggestions(suggestions) {
    if (suggestions) {
      this.suggestions = suggestions;
    }

    return this;
  }

  warning() {
    this.isWarning = true;

    return this;
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

    if (this.isWarning) {
      result.warning = true;
    }

    return result;
  }
}

module.exports = Issue;
