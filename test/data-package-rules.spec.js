'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const rulesRegistry = require('../lib/ddf-rules/registry');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const dataPackageRules = require('../lib/ddf-rules/data-package-rules');

chai.use(sinonChai);

describe('ddf datapackage.json validation', () => {
  describe('when INCORRECT_FILE', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        expect(dataPackageRules[rulesRegistry.INCORRECT_FILE](ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it('one issue should be found for expected folder "fixtures/wrong-file-in-dp"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/wrong-file-in-dp');

      ddfDataSet.load(() => {
        const EXPECTED_INCORRECT_FILE = 'ddf--entities--geo--foo.csv';
        const results = dataPackageRules[rulesRegistry.INCORRECT_FILE](ddfDataSet);

        expect(dataPackageRules[rulesRegistry.INCORRECT_FILE](ddfDataSet).length).to.equal(1);

        const result = _.head(results);

        expect(result.type).to.equal(rulesRegistry.INCORRECT_FILE);
        expect(_.endsWith(result.path, EXPECTED_INCORRECT_FILE)).to.be.true;

        done();
      });
    });
  });
  describe('when DATAPACKAGE_CONFUSED_FIELDS', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        expect(dataPackageRules[rulesRegistry.DATAPACKAGE_CONFUSED_FIELDS](ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it('3 issues should be found for expected folder "fixtures/rules-cases/datapackage-confused-fields"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/datapackage-confused-fields');

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_QUANTITY = 3;
        const results = dataPackageRules[rulesRegistry.DATAPACKAGE_CONFUSED_FIELDS](ddfDataSet);

        expect(results.length).to.equal(EXPECTED_ISSUES_QUANTITY);

        const EXPECTED_DATA = [{
          path: 'datapackage-confused-fields/ddf--concepts.csv',
          data: {
            dataPackageHeaders: ['conceptfoo', 'concept_type', 'name'],
            realHeaders: ['concept', 'concept_type', 'name'],
            headersDifference: ['conceptfoo']
          }
        }, {
          path: 'ddf--datapoints--gas_production_bcf--by--geo--year.csv',
          data: {
            dataPackageHeaders: ['geofoo', 'year', 'gas_production_bcf'],
            realHeaders: ['geo', 'year', 'gas_production_bcf'],
            headersDifference: ['geofoo']
          }
        }, {
          path: 'ddf--entities--geo.csv',
          data: {
            dataPackageHeaders: ['geofoo', 'geo_name'],
            realHeaders: ['geo', 'geo_name'],
            headersDifference: ['geofoo']
          }
        }];

        results.forEach((result, index) => {
          expect(result.type).to.equal(rulesRegistry.DATAPACKAGE_CONFUSED_FIELDS);
          expect(_.endsWith(result.path, EXPECTED_DATA[index].path)).to.be.true;
          expect(_.isEqual(result.data, EXPECTED_DATA[index].data)).to.be.true;
        });

        done();
      });
    });
  });
  describe('when DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        expect(dataPackageRules[rulesRegistry.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY](ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it(`3 issues should be found for expected folder 
    "fixtures/rules-cases/datapackage-non-concept-primary-key"`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/datapackage-non-concept-primary-key');

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_QUANTITY = 3;
        const results = dataPackageRules[rulesRegistry.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY](ddfDataSet);

        expect(results.length).to.equal(EXPECTED_ISSUES_QUANTITY);

        const EXPECTED_DATA = [{
          path: 'ddf--concepts.csv',
          data: {nonConcepts: ['conceptfoo']}
        }, {
          path: 'ddf--datapoints--gas_production_bcf--by--geo--year.csv',
          data: {nonConcepts: ['geo', 'year']}
        }, {
          path: 'ddf--entities--geo.csv',
          data: {nonConcepts: ['geofoo']}
        }];

        results.forEach((result, index) => {
          expect(result.type).to.equal(rulesRegistry.DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY);
          expect(_.endsWith(result.path, EXPECTED_DATA[index].path)).to.be.true;
          expect(_.isEqual(result.data, EXPECTED_DATA[index].data)).to.be.true;
        });

        done();
      });
    });
  });


  describe('when DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        expect(dataPackageRules[rulesRegistry.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME](ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it('3 issues should be found for expected folder "fixtures/rules-cases/non-unique-resource-name"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-resource-name');

      ddfDataSet.load(() => {
        const results = dataPackageRules[rulesRegistry.DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME](ddfDataSet);

        expect(results.length).to.equal(1);

        const result = _.head(results);
        const EXPECTED_DATA = {duplicates: ['ddf--concepts']};

        expect(_.isEqual(result.data, EXPECTED_DATA)).to.be.true;

        done();
      });
    });
  });
  describe('when DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        expect(dataPackageRules[rulesRegistry.DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE](ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it('3 issues should be found for expected folder "fixtures/rules-cases/non-unique-resource-file"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-resource-file');

      ddfDataSet.load(() => {
        const results = dataPackageRules[rulesRegistry.DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE](ddfDataSet);

        expect(results.length).to.equal(1);

        const result = _.head(results);
        const EXPECTED_DATA = {duplicates: ['ddf--concepts.csv']};

        expect(_.isEqual(result.data, EXPECTED_DATA)).to.be.true;

        done();
      });
    });
  });
});
