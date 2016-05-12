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

  describe('when "WRONG_ENTITY_IS_HEADER" rule', () => {
    afterEach(done => {
      ddfDataSet.dismiss(() => {
        done();
      });
    });

    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');
      ddfDataSet.load(() => {
        expect(entryRules[rulesRegistry.WRONG_ENTITY_IS_HEADER](ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/wrong-entity-is-header)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/wrong-entity-is-header');
      ddfDataSet.load(() => {
        const result = entryRules[rulesRegistry.WRONG_ENTITY_IS_HEADER](ddfDataSet);
        const issuesData = [
          {
            message: 'Not a concept',
            headerDetail: 'is--bar'
          },
          {
            message: 'Wrong concept type',
            headerDetail: 'is--geo'
          }
        ];

        expect(result.length).to.equal(issuesData.length);

        issuesData.forEach((issueData, index) => {
          expect(result[index].type).to.equal(rulesRegistry.WRONG_ENTITY_IS_HEADER);
          expect(!!result[index].data).to.be.true;
          expect(result[index].data.message).to.equal(issueData.message);
          expect(result[index].data.headerDetail).to.equal(issueData.headerDetail);
        });

        done();
      });
    });
  });

  describe('when "WRONG_ENTITY_IS_VALUE" rule', () => {
    afterEach(done => {
      ddfDataSet.dismiss(() => {
        done();
      });
    });

    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');
      ddfDataSet.load(() => {
        expect(entryRules[rulesRegistry.WRONG_ENTITY_IS_VALUE](ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/wrong-entity-is-value)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/wrong-entity-is-value');
      ddfDataSet.load(() => {
        const result = entryRules[rulesRegistry.WRONG_ENTITY_IS_VALUE](ddfDataSet);
        const issuesData = [
          {
            header: 'is--country',
            value: 'foo'
          },
          {
            header: 'is--capital',
            value: 'bar'
          }
        ];

        expect(result.length).to.equal(issuesData.length);

        issuesData.forEach((issueData, index) => {
          expect(result[index].type).to.equal(rulesRegistry.WRONG_ENTITY_IS_VALUE);
          expect(!!result[index].data).to.be.true;
          expect(result[index].data.header).to.equal(issueData.header);
          expect(result[index].data.value).to.equal(issueData.value);
        });

        done();
      });
    });
  });
});
