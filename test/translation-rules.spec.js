'use strict';

const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const translationRules = require('../lib/ddf-rules/translation-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('translation rules', () => {
  describe('when "UNEXPECTED_TRANSLATION_HEADER" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/dummy-companies)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies');

      ddfDataSet.load(() => {
        const results = translationRules[rulesRegistry.UNEXPECTED_TRANSLATION_HEADER](ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`expected issues should be found for folder with the problem
     (fixtures/rules-cases/unresolved-translation)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-translation-header');

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_LENGTH = 2;
        const results = translationRules[rulesRegistry.UNEXPECTED_TRANSLATION_HEADER](ddfDataSet);
        const EXPECTED_RESULTS = [{
          path: 'ddf--datapoints--company_size_string--by--company--anno.csv',
          data: {
            reason: 'non consistent primary key',
            primaryKey: ['company', 'anno'],
            translationHeaders: ['anno', 'company_size_string']
          }
        }, {
          path: 'ddf--entities--company.csv',
          data: {
            reason: 'extra data in translation',
            ddfFileHeaders: ['company', 'name', 'country', 'region'],
            translationHeaders: ['company', 'country', 'foo']
          }
        }];

        expect(results.length).to.equal(EXPECTED_ISSUES_LENGTH);

        results.forEach((result, index) => {
          expect(result.type).to.equal(rulesRegistry.UNEXPECTED_TRANSLATION_HEADER);
          expect(_.endsWith(result.path, EXPECTED_RESULTS[index].path)).to.be.true;
          expect(_.isEqual(result.data, EXPECTED_RESULTS[index].data)).to.be.true;
        });

        done();
      });
    });
  });
});
