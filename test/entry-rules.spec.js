'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfData = require('../lib/ddf-definitions/ddf-data');
const rulesRegistry = require('../lib/ddf-rules/registry');
const entryRules = require('../lib/ddf-rules/entity-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('rules for entry', () => {
  let ddfData = null;

  describe('when "ENTITY_HEADER_IS_NOT_CONCEPT" rule', () => {
    afterEach(done => {
      ddfData.dismiss(() => {
        done();
      });
    });

    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfData = new DdfData('./test/fixtures/good-folder');
      ddfData.load(() => {
        expect(entryRules[rulesRegistry.ENTITY_HEADER_IS_NOT_CONCEPT](ddfData).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/entity-header-is-no-concept)`, done => {
      ddfData = new DdfData('./test/fixtures/rules-cases/entity-header-is-no-concept');
      ddfData.load(() => {
        const result = entryRules[rulesRegistry.ENTITY_HEADER_IS_NOT_CONCEPT](ddfData);
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
