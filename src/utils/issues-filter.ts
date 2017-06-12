import { intersection, includes, isEmpty } from 'lodash';
import { tags } from '../ddf-rules/registry';

export const WRONG_TAGS_COMBINATION_ERROR =
  new Error('Impossible combination of parameters: "include-tags" and "exclude-tags"');
export const WRONG_RULES_COMBINATION_ERROR =
  new Error('Impossible combination of parameters: "include-rules" and "exclude-rules"');

export class IssuesFilter {
  private includeTags: string[] = [];
  private excludeTags: string[] = [];
  private includeRules: string[] = [];
  private excludeRules: string[] = [];

  constructor(settings: any = {}) {
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
    if (!isEmpty(this.includeTags) && !isEmpty(this.excludeTags)) {
      throw WRONG_TAGS_COMBINATION_ERROR;
    }

    if (!isEmpty(this.includeRules) && !isEmpty(this.excludeRules)) {
      throw WRONG_RULES_COMBINATION_ERROR;
    }
  }

  isAllowedByTags(issueType) {
    if (!isEmpty(this.includeTags)) {
      return intersection(
        this.includeTags,
        tags[issueType].map(tag => Symbol.keyFor(tag))
      ).length > 0;
    }

    if (!isEmpty(this.excludeTags)) {
      return intersection(
        this.excludeTags,
        tags[issueType].map(tag => Symbol.keyFor(tag))
      ).length === 0;
    }

    return true;
  }

  isAllowedByRules(issueType) {
    if (!isEmpty(this.includeRules)) {
      return includes(this.includeRules, Symbol.keyFor(issueType));
    }

    if (!isEmpty(this.excludeRules)) {
      return !includes(this.excludeRules, Symbol.keyFor(issueType));
    }

    return true;
  }

  isAllowed(issue) {
    return this.isAllowedByTags(issue) && this.isAllowedByRules(issue);
  }
}
