import { isEmpty, includes } from 'lodash';
import { descriptions, tags, howToFix, WARNING_TAG } from './registry';

export interface IssueView {
  id: string,
  type: string,
  howToFix: string,
  path: string,
  data,
  isWarning: boolean
}

export class Issue {
  public type: any;
  public suggestions: any[];
  public path: string;
  public data: any;

  constructor(type) {
    this.type = type;
    this.suggestions = [];
  }

  setPath(path: string): Issue {
    this.path = path;

    return this;
  }

  setData(data: any): Issue {
    this.data = data;

    return this;
  }

  setSuggestions(suggestions: Array<any>): Issue {
    if (suggestions) {
      this.suggestions = suggestions;
    }

    return this;
  }

  view(): IssueView {
    const result = {
      id: Symbol.keyFor(this.type),
      type: descriptions[this.type],
      howToFix: howToFix[this.type],
      path: this.path,
      data: this.data,
      isWarning: includes(tags[this.type], WARNING_TAG)
    };

    if (this.suggestions && this.suggestions.length > 0) {
      result['suggestions'] = this.suggestions;
    }

    if (!isEmpty(tags[this.type])) {
      result['tags'] = tags[this.type].map(tag => Symbol.keyFor(tag));
    }

    return result;
  }
}
