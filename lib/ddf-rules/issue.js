'use strict';

const _ = require('lodash');
const registry = require('./registry');

class Issue {
  constructor(type) {
    this.type = type;
    this.suggestions = [];
  }

  setPath(path) {
    this.path = path;

    return this;
  }

  setData(data) {
    this.data = data;

    return this;
  }

  setSuggestions(suggestions) {
    if (suggestions) {
      this.suggestions = suggestions;
    }

    return this;
  }

  view() {
    const result = {
      id: Symbol.keyFor(this.type),
      type: registry.descriptions[this.type],
      path: this.path,
      data: this.data
    };

    if (this.suggestions && this.suggestions.length > 0) {
      result.suggestions = this.suggestions;
    }

    if (!_.isEmpty(registry.tags[this.type])) {
      result.tags = registry.tags[this.type].map(tag => Symbol.keyFor(tag));
    }

    return result;
  }
}

module.exports = Issue;
