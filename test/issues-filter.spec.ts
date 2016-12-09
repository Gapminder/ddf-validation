import * as chai from 'chai';
import {
  NON_DDF_DATA_SET,
  NON_DDF_FOLDER,
  CONCEPT_ID_IS_NOT_UNIQUE
} from '../src/ddf-rules/registry';
import {
  IssuesFilter,
  WRONG_TAGS_COMBINATION_ERROR,
  WRONG_RULES_COMBINATION_ERROR
} from '../src/utils/issues-filter';
import {Issue} from '../src/ddf-rules/issue';

const expect = chai.expect;

describe('issues filter', () => {
  describe('when issues filter was constructed with "include-tags" and "exclude-tags"', () => {
    it('should WRONG_TAGS_COMBINATION_ERROR', done => {
      expect(() => new IssuesFilter({
        includeTags: 'some-tags',
        excludeTags: 'some-tags'
      })).to.throw(WRONG_TAGS_COMBINATION_ERROR);

      done();
    });
  });

  describe('when issues filter was constructed with "include-rules" and "exclude-rules"', () => {
    it('should WRONG_RULES_COMBINATION_ERROR', done => {
      expect(() => new IssuesFilter({
        includeRules: 'some-rules',
        excludeRules: 'some-rules'
      })).to.throw(WRONG_RULES_COMBINATION_ERROR);

      done();
    });
  });

  describe('when filter by rules with "include" mode', () => {
    it('should be allowed an issue with correct criteria (NON_DDF_DATA_SET)', done => {
      const issue = new Issue(NON_DDF_DATA_SET);
      const filter = new IssuesFilter({includeRules: 'NON_DDF_DATA_SET'});

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it('should NOT be allowed an issue with incorrect criteria (NON_DDF_FOLDER)', done => {
      const issue = new Issue(NON_DDF_FOLDER);
      const filter = new IssuesFilter({includeRules: 'NON_DDF_DATA_SET'});

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('should NOT be allowed an issue with non existing rule', done => {
      const issue = new Issue(NON_DDF_FOLDER);
      const filter = new IssuesFilter({includeRules: 'something-wrong'});

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });
  });

  describe('when filter by rules with "exclude" mode', () => {
    it('should NOT be allowed an issue with correct criteria (NON_DDF_DATA_SET)', done => {
      const issue = new Issue(NON_DDF_DATA_SET);
      const filter = new IssuesFilter({excludeRules: 'NON_DDF_DATA_SET'});

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('should be allowed an issue with incorrect criteria (NON_DDF_FOLDER)', done => {
      const issue = new Issue(NON_DDF_FOLDER);
      const filter = new IssuesFilter({excludeRules: 'NON_DDF_DATA_SET'});

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it('should be allowed an issue with non existing rule', done => {
      const issue = new Issue(NON_DDF_FOLDER);
      const filter = new IssuesFilter({excludeRules: 'something-wrong'});

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });
  });

  describe('when filter by tags with "include" mode', () => {
    it('should be allowed an issue with correct criteria (NON_DDF_DATA_SET & FILE_SYSTEM tag)', done => {
      const issue = new Issue(NON_DDF_DATA_SET);
      const filter = new IssuesFilter({includeTags: 'FILE_SYSTEM'});

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it(`should NOT be allowed an issue with incorrect criteria 
    (CONCEPT_ID_IS_NOT_UNIQUE & FILE_SYSTEM tag) `, done => {
      const issue = new Issue(CONCEPT_ID_IS_NOT_UNIQUE);
      const filter = new IssuesFilter({includeTags: 'FILE_SYSTEM'});

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('should NOT be allowed an issue with non existing tag', done => {
      const issue = new Issue(NON_DDF_DATA_SET);
      const filter = new IssuesFilter({includeTags: 'something-wrong'});

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });
  });

  describe('when filter by tags with "exclude" mode', () => {
    it('should NOT be allowed an issue with correct criteria (NON_DDF_DATA_SET & FILE_SYSTEM tag)', done => {
      const issue = new Issue(NON_DDF_DATA_SET);
      const filter = new IssuesFilter({excludeTags: 'FILE_SYSTEM'});

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('should be allowed an issue with incorrect existing criteria (NON_DDF_FOLDER & FILE_SYSTEM tag)', done => {
      const issue = new Issue(CONCEPT_ID_IS_NOT_UNIQUE);
      const filter = new IssuesFilter({excludeTags: 'FILE_SYSTEM'});

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it('should be allowed an issue with non existing rule', done => {
      const issue = new Issue(NON_DDF_FOLDER);
      const filter = new IssuesFilter({excludeTags: 'something-wrong'});

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });
  });
});
