'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const conceptRules = require('../lib/ddf-rules/concept-rules');

chai.use(sinonChai);

describe('rules for concept', () => {
  let ddfDataSet = null;

  describe('when "CONCEPT_ID_IS_NOT_UNIQUE" rule', () => {
    afterEach(done => {
      ddfDataSet.dismiss(() => {
        done();
      });
    });

    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');
      ddfDataSet.load(() => {
        expect(conceptRules[rulesRegistry.CONCEPT_ID_IS_NOT_UNIQUE](ddfDataSet)).to.be.null;

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/concept-is-not-unique)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/concept-is-not-unique');
      ddfDataSet.load(() => {
        const result = conceptRules[rulesRegistry.CONCEPT_ID_IS_NOT_UNIQUE](ddfDataSet);

        expect(result).to.be.not.null;
        expect(result.type).to.equal(rulesRegistry.CONCEPT_ID_IS_NOT_UNIQUE);
        expect(result.data.indexOf('geo')).to.be.greaterThan(-1);
        expect(result.data.indexOf('country')).to.be.greaterThan(-1);

        done();
      });
    });
  });
});
