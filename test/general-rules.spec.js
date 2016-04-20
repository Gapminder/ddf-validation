'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const generalRules = require('../lib/ddf-rules/general-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('general rules', () => {
  describe('when DDF folder is correct', () => {
    const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

    it('there should be no issues for "NON_DDF_DATA_SET" rule', done => {
      ddfDataSet.load(() => {
        const result = generalRules[rulesRegistry.NON_DDF_DATA_SET](ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });

    it('there should be no issues for "NON_DDF_FOLDER" rule', done => {
      ddfDataSet.load(() => {
        const result = generalRules[rulesRegistry.NON_DDF_FOLDER](ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });
  });

  describe('when DDF folder is NOT correct (fixtures/bad-folder)', () => {
    const folder = './test/fixtures/bad-folder';
    const ddfDataSet = new DdfDataSet(folder);

    Object.getOwnPropertySymbols(generalRules).forEach(generalRuleKey => {
      it(`one issue should be detected for "${Symbol.keyFor(generalRuleKey)}" rule`, done => {
        ddfDataSet.load(() => {
          const result = generalRules[generalRuleKey](ddfDataSet);

          expect(result.length).to.equal(1);

          done();
        });
      });

      it(`type of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be expected`, done => {
        ddfDataSet.load(() => {
          const result = generalRules[generalRuleKey](ddfDataSet);
          const issue = _.head(result);

          expect(issue.type).to.equal(generalRuleKey);

          done();
        });
      });

      it(`path of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be "${folder}"`, done => {
        ddfDataSet.load(() => {
          const result = generalRules[generalRuleKey](ddfDataSet);
          const issue = _.head(result);

          expect(issue.path).to.equal(folder);

          done();
        });
      });
    });
  });
});
