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
  describe('when "EMPTY_DATA" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        const results = generalRules[rulesRegistry.EMPTY_DATA](ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for indexed folder with the problem
     (fixtures/rules-cases/empty-data)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/empty-data');

      ddfDataSet.load(() => {
        const results = generalRules[rulesRegistry.EMPTY_DATA](ddfDataSet);
        const expectedFiles = [
          'ddf--datapoints--pop--by--country--year.csv',
          'ddf--entities--geo--country.csv'
        ];

        expect(results.length).to.equal(expectedFiles.length);

        results.forEach(result => {
          const fileIsExpected = !_.isEmpty(
            expectedFiles
              .filter(expectedFile =>
                _.endsWith(result.path, expectedFile))
          );

          expect(fileIsExpected).to.be.true;
        });

        done();
      });
    });
  });
});
