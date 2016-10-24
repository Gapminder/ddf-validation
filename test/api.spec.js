'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const api = require('../index');
const JSONValidator = api.JSONValidator;
const StreamValidator = api.StreamValidator;
const SimpleValidator = api.SimpleValidator;

chai.use(sinonChai);

describe('api', () => {
  describe('when JSONValidator', () => {
    describe('and DDF dataset is correct', () => {
      it('should NOT emit error', done => {
        const jsonValidator = new JSONValidator('./test/fixtures/good-folder-indexed');

        jsonValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        api.validate(jsonValidator);
      });

      it('should have NO issues', done => {
        const jsonValidator = new JSONValidator('./test/fixtures/good-folder-indexed');

        jsonValidator.on('finish', (err, jsonData) => {
          expect(!!err).to.be.false;
          expect(_.isEmpty(jsonData)).to.be.true;

          done();
        });

        api.validate(jsonValidator);
      });
    });

    describe('and DDF dataset is incorrect', () => {
      const path = './test/fixtures/wrong-file-in-index';

      it('should NOT emit error', done => {
        const jsonValidator = new JSONValidator(path);

        jsonValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        api.validate(jsonValidator);
      });

      it('should issues data is NOT empty', done => {
        const jsonValidator = new JSONValidator(path);

        jsonValidator.on('finish', (err, data) => {
          expect(!!err).to.be.false;
          expect(_.isEmpty(data)).to.be.false;

          done();
        });

        api.validate(jsonValidator);
      });

      it('should correctly handle "includeRules" settings', done => {
        const expectedRule = 'INCORRECT_FILE';
        const jsonValidator = new JSONValidator(path, {includeRules: expectedRule});

        jsonValidator.on('finish', (err, data) => {
          expect(!!err).to.be.false;
          expect(_.isEmpty(data)).to.be.false;
          expect(data.length).to.equal(1);

          const issue = _.head(data);

          expect(issue.id).to.equal(expectedRule);

          done();
        });

        api.validate(jsonValidator);
      });
    });
  });

  describe('when StreamValidator', () => {
    describe('and DDF dataset is correct', () => {
      it('should NOT emit error', done => {
        const streamValidator = new StreamValidator('./test/fixtures/good-folder-indexed');

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        api.validate(streamValidator);
      });

      it('should issues data is empty', done => {
        const streamValidator = new StreamValidator('./test/fixtures/good-folder-indexed');

        let issuesCount = 0;

        streamValidator.on('issue', () => {
          issuesCount++;
        });

        streamValidator.on('finish', () => {
          expect(issuesCount).to.equal(0);

          done();
        });

        api.validate(streamValidator);
      });
    });

    describe('and DDF dataset is incorrect', () => {
      const path = './test/fixtures/wrong-file-in-index';

      it('should NOT emit error', done => {
        const streamValidator = new StreamValidator(path);

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        api.validate(streamValidator);
      });

      it('should issues data are NOT empty', done => {
        const streamValidator = new StreamValidator(path);

        let issuesCount = 0;

        streamValidator.on('issue', () => {
          issuesCount++;
        });

        streamValidator.on('finish', () => {
          expect(issuesCount).to.be.greaterThan(0);

          done();
        });

        api.validate(streamValidator);
      });

      it('should correctly handle "includeRules" settings', done => {
        const expectedRule = 'INCORRECT_FILE';
        const streamValidator = new StreamValidator(path, {includeRules: expectedRule});

        let lastIssue = null;
        let issuesCount = 0;

        streamValidator.on('issue', issue => {
          lastIssue = issue;
          issuesCount++;
        });

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;
          expect(issuesCount).to.equal(1);
          expect(lastIssue.id).to.equal(expectedRule);

          done();
        });

        api.validate(streamValidator);
      });
    });
  });

  describe('when SimpleValidator', () => {
    describe('and DDF dataset is correct', () => {
      it('should dataset is correct', done => {
        const fundamentalValidator = new SimpleValidator('./test/fixtures/good-folder-indexed');

        fundamentalValidator.on('finish', (err, isDataSetCorrect) => {
          expect(!!err).to.be.false;
          expect(isDataSetCorrect).to.be.true;

          done();
        });

        api.validate(fundamentalValidator);
      });
    });

    describe('and DDF dataset is correct', () => {
      it('should dataset is correct', done => {
        const config = {indexlessMode: true};
        const issues = [];
        const streamValidator = new StreamValidator('./test/fixtures/good-folder', config);

        streamValidator.on('issue', issue => {
          issues.push(issue);
        });

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;
          expect(_.isEmpty(issues)).to.be.true;

          done();
        });

        api.validate(streamValidator);
      });
    });

    describe('and DDF dataset is incorrect', () => {
      const path = './test/fixtures/wrong-file-in-index';

      it('should dataset is NOT correct', done => {
        const fundamentalValidator = new SimpleValidator(path);

        fundamentalValidator.on('finish', (err, isDataSetCorrect) => {
          expect(!!err).to.be.false;
          expect(isDataSetCorrect).to.be.false;

          done();
        });

        api.validate(fundamentalValidator);
      });
    });
  });
});
