'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const rulesRegistry = require('../lib/ddf-rules/registry');
const IssuesFilter = require('../lib/utils/issues-filter');
const Issue = require('../lib/ddf-rules/issue');

chai.use(sinonChai);

describe('issues filter', () => {
  describe('when issues filter was constructed with "include-tags" and "exclude-tags"', () => {
    it('WRONG_TAGS_COMBINATION_ERROR should be raised', done => {
      expect(() => new IssuesFilter({
        includeTags: 'some-tags',
        excludeTags: 'some-tags'
      })).to.throw(IssuesFilter.WRONG_TAGS_COMBINATION_ERROR);

      done();
    });
  });

  describe('when issues filter was constructed with "include-rules" and "exclude-rules"', () => {
    it('WRONG_RULES_COMBINATION_ERROR should be raised', done => {
      expect(() => new IssuesFilter({
        includeRules: 'some-rules',
        excludeRules: 'some-rules'
      })).to.throw(IssuesFilter.WRONG_RULES_COMBINATION_ERROR);

      done();
    });
  });

  describe('when filter by rules with "include" mode', () => {
    it('issue with correct criteria (NON_DDF_DATA_SET) should be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_DATA_SET);
      const filter = new IssuesFilter({
        includeRules: 'NON_DDF_DATA_SET'
      });

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it('issue with incorrect existing criteria (NON_DDF_FOLDER) should NOT be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_FOLDER);
      const filter = new IssuesFilter({
        includeRules: 'NON_DDF_DATA_SET'
      });

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('issue with non existing rule should NOT be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_FOLDER);
      const filter = new IssuesFilter({
        includeRules: 'something-wrong'
      });

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });
  });

  describe('when filter by rules with "exclude" mode', () => {
    it('issue with correct criteria (NON_DDF_DATA_SET) should NOT be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_DATA_SET);
      const filter = new IssuesFilter({
        excludeRules: 'NON_DDF_DATA_SET'
      });

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('issue with incorrect existing criteria (NON_DDF_FOLDER) should be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_FOLDER);
      const filter = new IssuesFilter({
        excludeRules: 'NON_DDF_DATA_SET'
      });

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it('issue with non existing rule should be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_FOLDER);
      const filter = new IssuesFilter({
        excludeRules: 'something-wrong'
      });

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });
  });

  describe('when filter by tags with "include" mode', () => {
    it('issue with correct criteria (NON_DDF_DATA_SET & FILE_SYSTEM tag) should be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_DATA_SET);
      const filter = new IssuesFilter({
        includeTags: 'FILE_SYSTEM'
      });

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it(`issue with incorrect existing criteria 
    (CONCEPT_ID_IS_NOT_UNIQUE & FILE_SYSTEM tag) should NOT be allowed`, done => {
      const issue = new Issue(rulesRegistry.CONCEPT_ID_IS_NOT_UNIQUE);
      const filter = new IssuesFilter({
        includeTags: 'FILE_SYSTEM'
      });

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('issue with non existing tag should NOT be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_DATA_SET);
      const filter = new IssuesFilter({
        includeTags: 'something-wrong'
      });

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });
  });

  describe('when filter by tags with "exclude" mode', () => {
    it('issue with correct criteria (NON_DDF_DATA_SET & FILE_SYSTEM tag) should NOT be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_DATA_SET);
      const filter = new IssuesFilter({
        excludeTags: 'FILE_SYSTEM'
      });

      expect(filter.isAllowed(issue.type)).to.be.false;

      done();
    });

    it('issue with incorrect existing criteria (NON_DDF_FOLDER & FILE_SYSTEM tag) should be allowed', done => {
      const issue = new Issue(rulesRegistry.CONCEPT_ID_IS_NOT_UNIQUE);
      const filter = new IssuesFilter({
        excludeTags: 'FILE_SYSTEM'
      });

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });

    it('issue with non existing rule should be allowed', done => {
      const issue = new Issue(rulesRegistry.NON_DDF_FOLDER);
      const filter = new IssuesFilter({
        excludeTags: 'something-wrong'
      });

      expect(filter.isAllowed(issue.type)).to.be.true;

      done();
    });
  });
});
