'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfData = require('../lib/ddf-definitions/ddf-data');
const rulesRegistry = require('../lib/ddf-rules/registry');
const generalRules = require('../lib/ddf-rules/general-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('general rules', () => {
  describe('when DDF folder is correct', () => {
    const ddfData = new DdfData('./test/fixtures/good-folder');

    it('there should be no issues for "NON_DDF_DATA_SET" rule', done => {
      ddfData.load(() => {
        const result = generalRules[rulesRegistry.NON_DDF_DATA_SET](ddfData);

        expect(result.length).to.equal(0);

        done();
      });
    });

    it('there should be no issues for "NON_DDF_FOLDER" rule', done => {
      ddfData.load(() => {
        const result = generalRules[rulesRegistry.NON_DDF_FOLDER](ddfData);

        expect(result.length).to.equal(0);

        done();
      });
    });
  });

  describe('when DDF folder is NOT correct (fixtures/bad-folder)', () => {
    const folder = './test/fixtures/bad-folder';
    const ddfData = new DdfData(folder);

    Object.getOwnPropertySymbols(generalRules).forEach(generalRuleKey => {
      it(`one issue should be detected for "${Symbol.keyFor(generalRuleKey)}" rule`, done => {
        ddfData.load(() => {
          const result = generalRules[generalRuleKey](ddfData);

          expect(result.length).to.equal(1);

          done();
        });
      });

      it(`type of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be expected`, done => {
        ddfData.load(() => {
          const result = generalRules[generalRuleKey](ddfData);
          const issue = _.head(result);

          expect(issue.type).to.equal(generalRuleKey);

          done();
        });
      });

      it(`path of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be "${folder}"`, done => {
        ddfData.load(() => {
          const result = generalRules[generalRuleKey](ddfData);
          const issue = _.head(result);

          expect(issue.path).to.equal(folder);

          done();
        });
      });
    });
  });
});
