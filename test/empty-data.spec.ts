import * as chai from 'chai';
import {isEmpty, endsWith} from 'lodash';
import {DdfDataSet} from '../src/ddf-definitions/ddf-data-set';
import {EMPTY_DATA} from '../src/ddf-rules/registry';
import {allRules} from '../src/ddf-rules';

const expect = chai.expect;

describe('general rules', () => {
  describe('when "EMPTY_DATA" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

      ddfDataSet.load(() => {
        const results = allRules[EMPTY_DATA].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for indexed folder with the problem
     (fixtures/rules-cases/empty-data)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/empty-data', null);

      ddfDataSet.load(() => {
        const results = allRules[EMPTY_DATA].rule(ddfDataSet);
        const expectedFiles = [
          'ddf--datapoints--pop--by--country--year.csv',
          'ddf--entities--geo--country.csv'
        ];

        expect(results.length).to.equal(expectedFiles.length);

        results.forEach(result => {
          const fileIsExpected = !isEmpty(
            expectedFiles.filter(expectedFile => endsWith(result.path, expectedFile)));

          expect(fileIsExpected).to.be.true;
        });

        done();
      });
    });
  });
});
