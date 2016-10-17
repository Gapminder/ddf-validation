'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const generalRules = require('../lib/ddf-rules/general-rules');
const expect = chai.expect;

chai.use(sinonChai);

/* eslint-disable camelcase*/

describe('general rules', () => {
  describe('when "UNEXPECTED_DATA" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        const results = generalRules[rulesRegistry.UNEXPECTED_DATA](ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for indexed folder with the problem
     (fixtures/rules-cases/unexpected-data/indexed)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data/indexed');

      ddfDataSet.load(() => {
        const results = generalRules[rulesRegistry.UNEXPECTED_DATA](ddfDataSet);
        const expectedResult = [{
          path: 'ddf--index.csv',
          data: [{
            message: 'Too few fields: expected 3 fields but parsed 2',
            row: 2,
            type: 'FieldMismatch/TooFewFields',
            data: {
              key: 'geo,year',
              value: 'gas_production_bcf'
            }
          }]
        }, {
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
          expect(_.endsWith(result.path, expectedResult[index].path)).to.be.true;
          expect(_.isEqual(result.data, expectedResult[index].data)).to.be.true;
        });

        done();
      });
    });
    it(`issues should be found for indexless folder with the problem
     (fixtures/rules-cases/unexpected-data/indexless)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data/indexless');

      ddfDataSet.load(() => {
        const results = generalRules[rulesRegistry.UNEXPECTED_DATA](ddfDataSet);
        const expectedResult = [{
          path: 'ddf--concepts--measures.csv',
          data: [{
            message: 'Too few fields: expected 4 fields but parsed 1',
            row: 1,
            type: 'FieldMismatch/TooFewFields',
            data: {concept: 'lng'}
          }]
        }, {
          path: 'ddf--concepts.csv',
          data: [{
            message: 'Too few fields: expected 5 fields but parsed 2',
            row: 1,
            type: 'FieldMismatch/TooFewFields',
            data: {
              concept: 'drill_up',
              concept_type: ''
            }
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
          expect(_.endsWith(result.path, expectedResult[index].path)).to.be.true;
          expect(_.isEqual(result.data, expectedResult[index].data)).to.be.true;
        });

        done();
      });
    });
  });
});
