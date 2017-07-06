import * as chai from 'chai';
import {endsWith, isEqual} from 'lodash';
import {DdfDataSet} from '../src/ddf-definitions/ddf-data-set';
import {UNEXPECTED_DATA} from '../src/ddf-rules/registry';
import {allRules} from '../src/ddf-rules';

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('general rules', () => {
  describe('when "UNEXPECTED_DATA" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

      ddfDataSet.load(() => {
        const results = allRules[UNEXPECTED_DATA].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for indexed folder with the problem
     (fixtures/rules-cases/unexpected-data/with-dp)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data/with-dp', null);

      ddfDataSet.load(() => {
        const results = allRules[UNEXPECTED_DATA].rule(ddfDataSet);
        const expectedResult = [{
          path: 'ddf--concepts.csv',
          data: [{
            message: 'Too few fields: expected 3 fields but parsed 1',
            row: 1,
            type: 'FieldMismatch/TooFewFields',
            data: {concept: 'foo'}
          }]
        }];

        expect(results.length).to.equal(expectedResult.length);

        results.forEach((result, index) => {
          expect(endsWith(result.path, expectedResult[index].path)).to.be.true;
          expect(isEqual(result.data, expectedResult[index].data)).to.be.true;
        });

        done();
      });
    });
    it(`issues should be found for indexless folder with the problem
     (fixtures/rules-cases/unexpected-data/dp-less)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data/dp-less', null);

      ddfDataSet.load(() => {
        const results = allRules[UNEXPECTED_DATA].rule(ddfDataSet);
        const expectedResult = [{
          path: 'ddf--concepts.csv',
          data: [{
            message: 'Too few fields: expected 5 fields but parsed 2',
            row: 1,
            type: 'FieldMismatch/TooFewFields',
            data: {
              concept: 'drill_up',
              concept_type: ''
            }
          }, {
            message: 'Too few fields: expected 5 fields but parsed 4',
            row: 9,
            type: 'FieldMismatch/TooFewFields',
            data: {
              concept: 'lat',
              concept_type: 'measure',
              domain: '',
              name: 'Latitude'
            }
          }, {
            message: 'Too few fields: expected 5 fields but parsed 1',
            row: 10,
            type: 'FieldMismatch/TooFewFields',
            data: {concept: 'lng'}
          }]
        }, {
          path: 'ddf--datapoints--pop--by--country--year.csv',
          data: [{
            message: 'Too few fields: expected 3 fields but parsed 2',
            row: 0,
            type: 'FieldMismatch/TooFewFields',
            data: {
              country: 'vat',
              year: '1960'
            }
          }]
        }];

        expect(results.length).to.equal(expectedResult.length);

        results.forEach((result, index) => {
          expect(endsWith(result.path, expectedResult[index].path)).to.be.true;
          expect(isEqual(result.data, expectedResult[index].data)).to.be.true;
        });

        done();
      });
    });
  });
});
