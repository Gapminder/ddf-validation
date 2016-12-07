import {isEmpty} from 'lodash';
import {descriptions, tags} from './registry';

export class Issue {
  public type: any;
  public suggestions: Array<any>;
  public path: string;
  public data: any;

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
      type: descriptions[this.type],
      path: this.path,
      data: this.data
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
