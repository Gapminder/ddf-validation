import * as chai from 'chai';
import {head, endsWith, isEqual} from 'lodash';
import {
  INCORRECT_FILE,
  DATAPACKAGE_CONFUSED_FIELDS,
  DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY,
  DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE,
  DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME
} from '../src/ddf-rules/registry';
import {DdfDataSet} from '../src/ddf-definitions/ddf-data-set';
import {Issue} from '../src/ddf-rules/issue';
import {allRules} from '../src/ddf-rules';

const expect = chai.expect;

describe('ddf datapackage.json validation', () => {
  describe('when INCORRECT_FILE', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

      ddfDataSet.load(() => {
        expect(allRules[INCORRECT_FILE].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it('one issue should be found for expected folder "fixtures/wrong-file-in-dp"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/wrong-file-in-dp', null);

      ddfDataSet.load(() => {
        const EXPECTED_INCORRECT_FILE = 'ddf--entities--geo--foo.csv';
        const results: Array<Issue> = allRules[INCORRECT_FILE].rule(ddfDataSet);

        expect(results.length).to.equal(1);

        const result = head(results);

        expect(result.type).to.equal(INCORRECT_FILE);
        expect(endsWith(result.path, EXPECTED_INCORRECT_FILE)).to.be.true;

        done();
      });
    });

    it('one issue should be found for expected folder "fixtures/rules-cases/incorrect-file/non-print-chars"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/incorrect-file/non-print-chars', null);

      ddfDataSet.load(() => {
        const EXPECTED_REASON = 'Non printable characters in filename';
        const EXPECTED_SUGGESTION = 'ddf--entities--region.csv';
        const EXPECTED_INCORRECT_FILE = 'ddf--entities--regi\ron.csv';

        const results: Array<Issue> = allRules[INCORRECT_FILE].rule(ddfDataSet);

        expect(results.length).to.equal(1);

        const result = head(results);

        expect(result.type).to.equal(INCORRECT_FILE);
        expect(endsWith(result.path, EXPECTED_INCORRECT_FILE)).to.be.true;

        const suggestion = head(result.suggestions);

        expect(endsWith(suggestion, EXPECTED_SUGGESTION)).to.be.true;


        expect(result.data.reason).to.equal(EXPECTED_REASON);

        done();
      });
    });
  });
  describe('when DATAPACKAGE_CONFUSED_FIELDS', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

      ddfDataSet.load(() => {
        expect(allRules[DATAPACKAGE_CONFUSED_FIELDS].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it('3 issues should be found for expected folder "fixtures/rules-cases/datapackage-confused-fields"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/datapackage-confused-fields', null);

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_QUANTITY = 3;
        const results: Array<Issue> = allRules[DATAPACKAGE_CONFUSED_FIELDS].rule(ddfDataSet);

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
          expect(result.type).to.equal(DATAPACKAGE_CONFUSED_FIELDS);
          expect(endsWith(result.path, EXPECTED_DATA[index].path)).to.be.true;
          expect(isEqual(result.data, EXPECTED_DATA[index].data)).to.be.true;
        });

        done();
      });
    });
  });
  describe('when DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

      ddfDataSet.load(() => {
        expect(allRules[DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });
    it(`3 issues should be found for expected folder 
    "fixtures/rules-cases/datapackage-non-concept-primary-key"`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/datapackage-non-concept-primary-key', null);

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_QUANTITY = 3;
        const results: Array<Issue> = allRules[DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY].rule(ddfDataSet);

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
          expect(result.type).to.equal(DATAPACKAGE_NON_CONCEPT_PRIMARY_KEY);
          expect(endsWith(result.path, EXPECTED_DATA[index].path)).to.be.true;
          expect(isEqual(result.data, EXPECTED_DATA[index].data)).to.be.true;
        });

        done();
      });
    });
  });


  describe('when DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

      ddfDataSet.load(() => {
        const results: Array<Issue> = allRules[DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });
    it('3 issues should be found for expected folder "fixtures/rules-cases/non-unique-resource-name"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-resource-name', null);

      ddfDataSet.load(() => {
        const results: Array<Issue> = allRules[DATAPACKAGE_NON_UNIQUE_RESOURCE_NAME].rule(ddfDataSet);

        expect(results.length).to.equal(1);

        const result = head(results);
        const EXPECTED_DATA = {duplicates: ['ddf--concepts']};

        expect(isEqual(result.data, EXPECTED_DATA)).to.be.true;

        done();
      });
    });
  });
  describe('when DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE', () => {
    it('any issue should NOT be found for folder (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

      ddfDataSet.load(() => {
        const results: Array<Issue> = allRules[DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });
    it('3 issues should be found for expected folder "fixtures/rules-cases/non-unique-resource-file"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-resource-file', null);

      ddfDataSet.load(() => {
        const results: Array<Issue> = allRules[DATAPACKAGE_NON_UNIQUE_RESOURCE_FILE].rule(ddfDataSet);

        expect(results.length).to.equal(1);

        const result = head(results);
        const EXPECTED_DATA = {duplicates: ['ddf--concepts.csv']};

        expect(isEqual(result.data, EXPECTED_DATA)).to.be.true;

        done();
      });
    });
  });
});
