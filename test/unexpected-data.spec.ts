import * as chai from 'chai';
import { endsWith, isEqual, head, isArray } from 'lodash';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';
import { UNEXPECTED_DATA } from '../src/ddf-rules/registry';
import { allRules } from '../src/ddf-rules';
import { Issue } from "../src/ddf-rules/issue";
import { expectedWringCsvData } from "./e2e.spec";

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('general rules', () => {
  describe('when "UNEXPECTED_DATA" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-dp', null);

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
        try {
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
        } catch (e) {
          done(e);
        }
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

    it(`issues should be found for a folder with inconsistent columns in csv (fixtures/rules-cases/unexpected-data-2)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data-2', null);

      ddfDataSet.load(() => {
        const issues: Issue[] = allRules[UNEXPECTED_DATA].rule(ddfDataSet);
        const expectedData = {
          path: 'ddf--concepts.csv',
          message: 'Too many fields: expected 3 fields but parsed 4',
          row: 0,
          type: 'FieldMismatch/TooManyFields'
        };

        const issue: Issue = head(issues);
        const data: any = head(issue.data);

        expect(issues.length).to.equal(1);
        expect(issue.data.length).to.equal(1);

        expect(endsWith(issue.path, expectedData.path)).to.be.true;
        expect(data.message).to.equal(expectedData.message);
        expect(data.row).to.equal(expectedData.row);
        expect(data.type).to.equal(expectedData.type);

        done();
      });
    });

    it(`issues should be found for a folder with inconsistent columns in csv (fixtures/rules-cases/unexpected-data-3)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data-3', null);

      ddfDataSet.load(() => {
        const issues: Issue[] = allRules[UNEXPECTED_DATA].rule(ddfDataSet);
        const expectedData = {
          path: 'ddf--concepts.csv',
          message: 'Too many fields: expected 3 fields but parsed 4',
          type: 'FieldMismatch/TooManyFields'
        };
        const expectedDataLength = 3;
        const issue: Issue = head(issues);

        issue.data.forEach((item, row) => {
          expect(issues.length).to.equal(1);
          expect(issue.data.length).to.equal(expectedDataLength);
          expect(endsWith(issue.path, expectedData.path)).to.be.true;

          expect(item.message).to.equal(expectedData.message);
          expect(item.row).to.equal(row);
          expect(item.type).to.equal(expectedData.type);
        });

        done();
      });
    });

    it(`issues should be found for a folder with inconsistent columns in csv (fixtures/wrong-csv)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/wrong-csv', null);

      ddfDataSet.load((err) => {
        expect(!!err).to.be.true;
        expect(isArray(err)).to.be.true;

        const issue: any = head(err);

        expect(issue.file).to.be.contains('ddf--entities--tag.csv');
        expect(issue.csvChecker.errors).to.be.deep.equal(expectedWringCsvData);

        done();
      });
    });
  });
});
