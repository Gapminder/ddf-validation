import * as chai from 'chai';
import { parallel } from 'async';
import { head, isEmpty, isEqual } from 'lodash';
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
        const issues = [];
        const streamValidator = new StreamValidator('./test/fixtures/good-folder', {});

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

      it('should custom settings be processed correctly (excludeDirs as string)', done => {
        const issues = [];
        const streamValidator = new StreamValidator('./test/fixtures/good-folder', {
          excludeRules: 'WRONG_DATA_POINT_HEADER',
          excludeDirs: '.gitingore, .git',
          isCheckHidden: true
        });
        const EXPECTED_SETTINGS = {
          excludeRules: 'WRONG_DATA_POINT_HEADER',
          excludeDirs: ['.gitingore', '.git'],
          isCheckHidden: true
        };

        streamValidator.on('issue', issue => {
          issues.push(issue);
        });

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;
          expect(isEmpty(issues)).to.be.true;
          expect(isEqual(streamValidator.settings, EXPECTED_SETTINGS));

          done();
        });

        validate(streamValidator);
      });

      it('should custom settings be processed correctly (excludeDirs as array)', done => {
        const issues = [];
        const EXPECTED_SETTINGS = {
          excludeRules: 'WRONG_DATA_POINT_HEADER',
          excludeDirs: ['.gitingore', '.git'],
          isCheckHidden: true
        };
        const streamValidator = new StreamValidator('./test/fixtures/good-folder', EXPECTED_SETTINGS);

        streamValidator.on('issue', issue => {
          issues.push(issue);
        });

        streamValidator.on('finish', err => {
          expect(!!err).to.be.false;
          expect(isEmpty(issues)).to.be.true;
          expect(isEqual(streamValidator.settings, EXPECTED_SETTINGS));

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

  describe('run validator under multi thread mode', () => {
    const _JSONValidator = require('../lib/index').JSONValidator;

    it('should result for generic and multi thread modes be same ', done => {
      const EXPECTED_ISSUES_COUNT = 6;
      const DATA_SET_PATH = './test/fixtures/rules-cases/data-point-constraint-violation';

      parallel({
          generic: onDataSetValidated => {
            const jsonValidator = new _JSONValidator(DATA_SET_PATH, null);

            jsonValidator.on('finish', onDataSetValidated);

            validate(jsonValidator);
          },
          multithread: onDataSetValidated => {
            const jsonValidator = new _JSONValidator(DATA_SET_PATH, {
              isMultithread: true
            });

            jsonValidator.on('finish', onDataSetValidated);

            validate(jsonValidator);
          }
        },
        (err, results) => {
          expect(!!err).to.be.false;
          expect((<any[]>results.generic).length).to.equal(EXPECTED_ISSUES_COUNT);
          expect((<any[]>results.generic).length).to.equal((<any[]>results.multithread).length);

          for (let issueFromGeneric of <any[]>results.generic) {
            const sameIssue = (<any[]>results.multithread).find(issue => isEqual(issueFromGeneric, issue));

            expect(!!sameIssue).to.be.true;
            expect(!!sameIssue.type).to.be.true;
            expect(!!sameIssue.path).to.be.true;
            expect(!!sameIssue.data).to.be.true;
          }

          done();
        }
      );
    });
  });
});
