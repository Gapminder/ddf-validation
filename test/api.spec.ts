import * as chai from 'chai';
import { head, isEmpty } from 'lodash';
import { JSONValidator, StreamValidator, SimpleValidator, validate } from '../src/index';

const expect = chai.expect;

describe('api', () => {
  describe('when JSONValidator', () => {
    describe('and DDF dataset is correct', () => {
      it('should NOT emit error', done => {
        const jsonValidator = new JSONValidator('./test/fixtures/good-folder-dp', null);

        jsonValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        validate(jsonValidator);
      });

      it('should have NO issues', done => {
        const jsonValidator = new JSONValidator('./test/fixtures/good-folder-dp', null);

        jsonValidator.on('finish', (err, jsonData) => {
          expect(!!err).to.be.false;
          expect(isEmpty(jsonData)).to.be.true;

          done();
        });

        validate(jsonValidator);
      });
    });

    describe('and DDF dataset is incorrect', () => {
      const path = './test/fixtures/wrong-file-in-dp';

      it('should NOT emit error', done => {
        const jsonValidator = new JSONValidator(path, null);

        jsonValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        validate(jsonValidator);
      });

      it('should issues data is NOT empty', done => {
        const jsonValidator = new JSONValidator(path, null);

        jsonValidator.on('finish', (err, data) => {
          expect(!!err).to.be.false;
          expect(isEmpty(data)).to.be.false;

          done();
        });

        validate(jsonValidator);
      });

      it('should correctly handle "includeRules" settings', done => {
        const expectedRule = 'INCORRECT_FILE';
        const jsonValidator = new JSONValidator(path, {includeRules: expectedRule});

        jsonValidator.on('finish', (err, data) => {
          expect(!!err).to.be.false;
          expect(isEmpty(data)).to.be.false;
          expect(data.length).to.equal(1);

          const issue: any = head(data);

          expect(issue.id).to.equal(expectedRule);

          done();
        });

        validate(jsonValidator);
      });
    });
  });

  describe('when StreamValidator', () => {
    describe('and DDF dataset is correct', () => {
      it('should NOT emit error', done => {
        const streamValidator = new StreamValidator('./test/fixtures/good-folder-dp', null);

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        validate(streamValidator);
      });

      it('should issues data is empty', done => {
        const streamValidator = new StreamValidator('./test/fixtures/good-folder-dp', null);

        let issuesCount = 0;

        streamValidator.on('issue', () => {
          issuesCount++;
        });

        streamValidator.on('finish', () => {
          expect(issuesCount).to.equal(0);

          done();
        });

        validate(streamValidator);
      });
    });

    describe('and DDF dataset is incorrect', () => {
      const path = './test/fixtures/wrong-file-in-dp';

      it('should NOT emit error', done => {
        const streamValidator = new StreamValidator(path, null);

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;

          done();
        });

        validate(streamValidator);
      });

      it('should issues data are NOT empty', done => {
        const streamValidator = new StreamValidator(path, null);

        let issuesCount = 0;

        streamValidator.on('issue', () => {
          issuesCount++;
        });

        streamValidator.on('finish', () => {
          expect(issuesCount).to.be.greaterThan(0);

          done();
        });

        validate(streamValidator);
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

        validate(streamValidator);
      });
    });
  });

  describe('when SimpleValidator', () => {
    describe('and DDF dataset is correct', () => {
      it('should dataset is correct', done => {
        const fundamentalValidator = new SimpleValidator('./test/fixtures/good-folder-dp', null);

        fundamentalValidator.on('finish', (err, isDataSetCorrect) => {
          expect(!!err).to.be.false;
          expect(isDataSetCorrect).to.be.true;

          done();
        });

        validate(fundamentalValidator);
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
          expect(isEmpty(issues)).to.be.true;

          done();
        });

        validate(streamValidator);
      });
    });

    describe('and DDF dataset is incorrect', () => {
      const path = './test/fixtures/wrong-file-in-dp';

      it('should dataset is NOT correct', done => {
        const fundamentalValidator = new SimpleValidator(path, null);

        fundamentalValidator.on('finish', (err, isDataSetCorrect) => {
          expect(!!err).to.be.false;
          expect(isDataSetCorrect).to.be.false;

          done();
        });

        validate(fundamentalValidator);
      });
    });
  });
});
