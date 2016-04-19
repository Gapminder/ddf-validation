'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfData = require('../lib/ddf-definitions/ddf-data');
const rulesRegistry = require('../lib/ddf-rules/registry');
const indexRules = require('../lib/ddf-rules/index-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('rules for index', () => {
  let ddfData = null;

  describe('when wrong file in index details', () => {
    beforeEach(() => {
      ddfData = new DdfData('./test/fixtures/wrong-file-in-index');
    });

    afterEach(done => {
      ddfData.dismiss(() => {
        done();
      });
    });

    it('one issue should be found', done => {
      ddfData.load(() => {
        const result = indexRules[rulesRegistry.INCORRECT_FILE](ddfData);

        expect(result.length).to.equal(1);

        done();
      });
    });

    it('issue should be "INCORRECT_FILE" type', done => {
      ddfData.load(() => {
        const result = indexRules[rulesRegistry.INCORRECT_FILE](ddfData);

        expect(result[0].type).to.equal(rulesRegistry.INCORRECT_FILE);

        done();
      });
    });

    it('path field of the issue should contain "foo.csv"', done => {
      ddfData.load(() => {
        const result = indexRules[rulesRegistry.INCORRECT_FILE](ddfData);

        expect(result[0].path.indexOf('foo.csv')).to.be.greaterThan(0);

        done();
      });
    });
  });

  describe('when index is correct', () => {
    afterEach(done => {
      ddfData.dismiss(() => {
        done();
      });
    });

    it('there should be no issues', done => {
      ddfData = new DdfData('./test/fixtures/dummy-companies-with-index');
      ddfData.load(() => {
        const result = indexRules[rulesRegistry.INCORRECT_FILE](ddfData);

        expect(result.length).to.equal(0);

        done();
      });
    });
  });

  describe('when index does not exist', () => {
    beforeEach(() => {
      ddfData = new DdfData('./test/fixtures/dummy-companies');
    });

    afterEach(done => {
      ddfData.dismiss(() => {
        done();
      });
    });

    it('1 error should be recognized', done => {
      ddfData.load(() => {
        const result = indexRules[rulesRegistry.INDEX_IS_NOT_FOUND](ddfData);

        expect(!!result).to.equal(true);
        expect(result.length).to.equal(1);

        done();
      });
    });

    it('error should contain "INDEX_IS_NOT_FOUND" type', done => {
      ddfData.load(() => {
        const result = indexRules[rulesRegistry.INDEX_IS_NOT_FOUND](ddfData);

        expect(result[0].type).to.equal(rulesRegistry.INDEX_IS_NOT_FOUND);

        done();
      });
    });

    it('data from issue should contain an input ddf path', done => {
      ddfData.load(() => {
        const result = indexRules[rulesRegistry.INDEX_IS_NOT_FOUND](ddfData);

        expect(result[0].path).to.equal('./test/fixtures/dummy-companies');

        done();
      });
    });
  });
});
