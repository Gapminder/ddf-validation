'use strict';

const _ = require('lodash');
const rulesRegistry = require('../ddf-rules/registry');

const WRONG_TAGS_COMBINATION_ERROR =
  new Error('Impossible combination of parameters: "include-tags" and "exclude-tags"');
const WRONG_RULES_COMBINATION_ERROR =
  new Error('Impossible combination of parameters: "include-rules" and "exclude-rules"');

class IssuesFilter {

  constructor(settings) {
    if (settings.includeTags) {
      this.includeTags = settings.includeTags.split(' ');
    }

    if (settings.excludeTags) {
      this.excludeTags = settings.excludeTags.split(' ');
    }

    if (settings.includeRules) {
      this.includeRules = settings.includeRules.split(' ');
    }

    if (settings.excludeRules) {
      this.excludeRules = settings.excludeRules.split(' ');
    }

    this.checkIntegrity();
  }

  checkIntegrity() {
    if (this.includeTags && this.excludeTags) {
      throw WRONG_TAGS_COMBINATION_ERROR;
    }

    if (this.includeRules && this.excludeRules) {
      throw WRONG_RULES_COMBINATION_ERROR;
    }
  }

  isAllowedByTags(issueType) {
    if (this.includeTags) {
      return _.intersection(
          this.includeTags,
          rulesRegistry.tags[issueType].map(tag => Symbol.keyFor(tag))
        ).length > 0;
    }

    if (this.excludeTags) {
      return _.intersection(
          this.excludeTags,
          rulesRegistry.tags[issueType].map(tag => Symbol.keyFor(tag))
        ).length === 0;
    }

    return true;
  }

  isAllowedByRules(issueType) {
    if (this.includeRules) {
      return _.includes(this.includeRules, Symbol.keyFor(issueType));
    }

    if (this.excludeRules) {
      return !_.includes(this.excludeRules, Symbol.keyFor(issueType));
    }

    return true;
  }

  isAllowed(issue) {
    return this.isAllowedByTags(issue) && this.isAllowedByRules(issue);
  }
}

IssuesFilter.WRONG_TAGS_COMBINATION_ERROR = WRONG_TAGS_COMBINATION_ERROR;
IssuesFilter.WRONG_RULES_COMBINATION_ERROR = WRONG_RULES_COMBINATION_ERROR;

module.exports = IssuesFilter;
