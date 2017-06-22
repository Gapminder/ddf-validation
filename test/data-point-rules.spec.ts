import * as chai from 'chai';
import { head, flattenDeep, compact, isEqual, endsWith } from 'lodash';
import { parallelLimit } from 'async';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';
import {
  MEASURE_VALUE_NOT_NUMERIC,
  DATA_POINT_UNEXPECTED_ENTITY_VALUE,
  DATA_POINT_UNEXPECTED_TIME_VALUE,
  DATA_POINT_CONSTRAINT_VIOLATION,
  DUPLICATED_DATA_POINT_KEY
} from '../src/ddf-rules/registry';
import { createRecordBasedRuleProcessor } from '../src/index';
import { allRules } from '../src/ddf-rules';
import { Issue } from '../src/ddf-rules/issue';

const expect = chai.expect;
const CONCURRENT_OPERATIONS_AMOUNT = 30;

describe('rules for data points', () => {
  let ddfDataSet = null;

  describe(`when data set is correct ('fixtures/good-folder')`, () => {
    ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);

    Object.getOwnPropertySymbols(allRules).forEach(dataPointRuleKey => {
      it(`any issue should NOT be found for rule ${Symbol.keyFor(dataPointRuleKey)}`, done => {
        ddfDataSet.load(() => {
          const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors);

          ddfDataSet.getDataPoint().loadFile(
            fileDescriptor,
            (record, line) => {
              if (allRules[dataPointRuleKey].isDataPoint && allRules[dataPointRuleKey].recordRule) {
                expect(allRules[dataPointRuleKey].recordRule({
                  ddfDataSet,
                  fileDescriptor,
                  record,
                  line
                }).length).to.equal(0);
              }
            },
            () => done()
          );
        });
      });
    });
  });


  describe('when data set is NOT correct', () => {
    /*
    it(`an issue should be found for rule 'DATA_POINT_VALUE_NOT_NUMERIC'
   (fixtures/rules-cases/data-point-value-not-num)`, done => {
      const EXPECTED_FILE = 'ddf--datapoints--pop--by--country--year.csv';

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-value-not-num', null);
      ddfDataSet.load(() => {
        const dataPointValueNotNumRule = allRules[MEASURE_VALUE_NOT_NUMERIC].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors.filter(descriptor => descriptor.file === EXPECTED_FILE));
        const expectedMeasure = 'pop';
        const expectedLine = 2;
        const expectedValue = 'huge';

        ddfDataSet.getDataPoint().loadFile(fileDescriptor,
          (record, line) => {
            const issues: Array<Issue> = dataPointValueNotNumRule({ddfDataSet, fileDescriptor, record, line});
            const issue = head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(MEASURE_VALUE_NOT_NUMERIC);
            expect(issue.path.endsWith(EXPECTED_FILE)).to.be.true;
            expect(!!issue.data).to.be.true;
            expect(issue.data.measure).to.equal(expectedMeasure);
            expect(issue.data.line).to.equal(expectedLine);
            expect(issue.data.value).to.equal(expectedValue);
          },
          () => done()
        );
      });
    });
    */

    it(`an issue should be found for rule 'DATA_POINT_UNEXPECTED_ENTITY_VALUE'
   (fixtures/rules-cases/data-point-unexpected-entity-value)`, done => {
      const EXPECTED_FILE = 'ddf--datapoints--pop--by--country--year.csv';

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-entity-value', null);
      ddfDataSet.load(() => {
        const dataPointUnexpectedConceptRule = allRules[DATA_POINT_UNEXPECTED_ENTITY_VALUE].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors.filter(descriptor => descriptor.file === EXPECTED_FILE));
        const expectedConcept = 'country';
        const expectedLine = 2;
        const expectedValue = 'non-usa';

        ddfDataSet.getDataPoint().loadFile(
          fileDescriptor,
          (record, line) => {
            const issues: Array<Issue> = dataPointUnexpectedConceptRule({ddfDataSet, fileDescriptor, record, line});
            const issue = head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(DATA_POINT_UNEXPECTED_ENTITY_VALUE);
            expect(issue.path.endsWith(EXPECTED_FILE)).to.be.true;
            expect(!!issue.data).to.be.true;
            expect(issue.data.concept).to.equal(expectedConcept);
            expect(issue.data.line).to.equal(expectedLine);
            expect(issue.data.value).to.equal(expectedValue);
          },
          () => done()
        );
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_UNEXPECTED_TIME_VALUE'
   (fixtures/rules-cases/data-point-unexpected-time-value)`, done => {
      const EXPECTED_FILE = 'ddf--datapoints--pop--by--country--year.csv';

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-time-value', null);
      ddfDataSet.load(() => {
        const dataPointUnexpectedTimeRule = allRules[DATA_POINT_UNEXPECTED_TIME_VALUE].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors.filter(descriptor => descriptor.file === EXPECTED_FILE));
        const expectedConcept = 'year';
        const expectedLine = 2;
        const expectedValue = '1960wfoo';

        ddfDataSet.getDataPoint().loadFile(
          fileDescriptor,
          (record, line) => {
            const issues: Array<Issue> = dataPointUnexpectedTimeRule({ddfDataSet, fileDescriptor, record, line});
            const issue = head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(DATA_POINT_UNEXPECTED_TIME_VALUE);
            expect(issue.path.endsWith(EXPECTED_FILE)).to.be.true;
            expect(!!issue.data).to.be.true;
            expect(issue.data.concept).to.equal(expectedConcept);
            expect(issue.data.line).to.equal(expectedLine);
            expect(issue.data.value).to.equal(expectedValue);
          },
          () => done()
        );
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_UNEXPECTED_ENTITY_VALUE'
   (fixtures/rules-cases/data-point-unexpected-entity-value-2)`, done => {
      const EXPECTED_FILE = 'ddf--datapoints--pop--by--geo--year.csv';

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-entity-value-2', null);
      ddfDataSet.load(() => {
        const dataPointUnexpectedConceptRule = allRules[DATA_POINT_UNEXPECTED_ENTITY_VALUE].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors.filter(descriptor => descriptor.file === EXPECTED_FILE));
        const expectedConcept = 'geo';
        const expectedLine = 2;
        const expectedValue = 'Afg';

        ddfDataSet.getDataPoint().loadFile(
          fileDescriptor,
          (record, line) => {
            const issues: Array<Issue> = dataPointUnexpectedConceptRule({ddfDataSet, fileDescriptor, record, line});
            const issue = head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(DATA_POINT_UNEXPECTED_ENTITY_VALUE);
            expect(issue.path.endsWith(EXPECTED_FILE)).to.be.true;
            expect(!!issue.data).to.be.true;
            expect(issue.data.concept).to.equal(expectedConcept);
            expect(issue.data.line).to.equal(expectedLine);
            expect(issue.data.value).to.equal(expectedValue);
          },
          () => done()
        );
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_CONSTRAINT_VIOLATION'
   (fixtures/rules-cases/data-point-constraint-violation)`, done => {
      const EXPECTED_FILE = 'ddf--datapoints--population--by--country_code-900--year--age.csv';

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-constraint-violation', null);
      ddfDataSet.load(() => {
        const dataPointConstraintViolationRule = allRules[DATA_POINT_CONSTRAINT_VIOLATION].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors.filter(descriptor => descriptor.file === EXPECTED_FILE));
        const issuesStorage = [];
        const EXPECTED_ISSUES_QUANTITY = 2;
        const EXPECTED_ISSUES_DATA = [{
          path: EXPECTED_FILE,
          data: {constraints: ['900'], fieldName: 'country_code', fieldValue: '777', line: 1}
        }, {
          path: EXPECTED_FILE,
          data: {constraints: ['900'], fieldName: 'country_code', fieldValue: '901', line: 3}
        }];

        ddfDataSet.getDataPoint().loadFile(fileDescriptor,
          (record, line) => {
            issuesStorage.push(dataPointConstraintViolationRule({ddfDataSet, fileDescriptor, record, line}));
          },
          () => {
            const issues = compact(flattenDeep(issuesStorage));

            expect(issues.length).to.equal(EXPECTED_ISSUES_QUANTITY);

            issues.forEach((issue: Issue, index: number) => {
              expect(issue.type).to.equal(DATA_POINT_CONSTRAINT_VIOLATION);
              expect(issue.path.endsWith(EXPECTED_ISSUES_DATA[index].path)).to.be.true;
              expect(!!issue.data).to.be.true;
              expect(isEqual(issue.data, EXPECTED_ISSUES_DATA[index].data)).to.be.true;
            });

            done();
          }
        );
      });
    });
  });

  describe('when "DUPLICATED_KEY" rule', () => {
    it('an issue should be found for "fixtures/rules-cases/duplicated-data-point-key"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/duplicated-data-point-key', null);
      const tempResults = [];

      allRules[DUPLICATED_DATA_POINT_KEY].resetStorage();

      ddfDataSet.load(() => {
        const actionsSource: any[] = ddfDataSet.getDataPoint().fileDescriptors.map(fileDescriptor =>
          createRecordBasedRuleProcessor(
            {
              ddfDataSet,
              ruleKey: DUPLICATED_DATA_POINT_KEY,
              rule: allRules[DUPLICATED_DATA_POINT_KEY],
              issuesFilter: {isAllowed: () => true}
            },
            fileDescriptor,
            result => {
              tempResults.push(result);
            }
          )
        );
        const actions = <any>flattenDeep(actionsSource);

        parallelLimit(actions, CONCURRENT_OPERATIONS_AMOUNT, () => {
          const results = compact(tempResults);
          const EXPECTED_RESULT = {
            path: 'ddf--datapoints--gas_production_bcf--by--geo--year.csv',
            data: [
              [
                {
                  file: 'ddf--datapoints--gas_production_bcf--by--geo--year.csv',
                  record: {
                    geo: 'algeria',
                    year: '1977',
                    gas_production_bcf: '0.74553176325556'
                  },
                  line: 7
                },
                {
                  file: 'ddf--datapoints--gas_production_bcf--by--geo--year.csv',
                  record: {
                    geo: 'algeria',
                    year: '1977',
                    gas_production_bcf: '1.15619237401781'
                  },
                  line: 8
                }
              ]
            ]
          };

          expect(results.length).to.equal(1);

          const result = head(results);

          expect(result.type).to.equal(DUPLICATED_DATA_POINT_KEY);
          expect(endsWith(result.path, EXPECTED_RESULT.path)).to.be.true;
          expect(isEqual(result.data, EXPECTED_RESULT.data)).to.be.true;

          done();
        });
      });
    });
  });
});
