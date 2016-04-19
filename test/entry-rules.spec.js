'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const entryRules = require('../lib/ddf-rules/entity-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('rules for entry', () => {
  let ddfDataSet = null;

  describe('when "ENTITY_HEADER_IS_NOT_CONCEPT" rule', () => {
    afterEach(done => {
      ddfDataSet.dismiss(() => {
        done();
      });
    });

    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');
      ddfDataSet.load(() => {
        expect(entryRules[rulesRegistry.ENTITY_HEADER_IS_NOT_CONCEPT](ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/entity-header-is-no-concept)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/entity-header-is-no-concept');
      ddfDataSet.load(() => {
        const result = entryRules[rulesRegistry.ENTITY_HEADER_IS_NOT_CONCEPT](ddfDataSet);
        const EXPECTED_ERROR_COUNT = 2;

        expect(result.length).to.equal(EXPECTED_ERROR_COUNT);
        expect(result[0].type).to.equal(rulesRegistry.ENTITY_HEADER_IS_NOT_CONCEPT);
        expect(result[0].data).to.equal('foo');
        expect(result[1].type).to.equal(rulesRegistry.ENTITY_HEADER_IS_NOT_CONCEPT);
        expect(result[1].data).to.equal('is--bar');

        done();
      });
    });
  });
});
