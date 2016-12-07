import * as chai from 'chai';
import {head} from 'lodash';
import {DdfDataSet} from '../src/ddf-definitions/ddf-data-set';
import {
  MEASURE_VALUE_NOT_NUMERIC,
  DATA_POINT_UNEXPECTED_ENTITY_VALUE,
  DATA_POINT_UNEXPECTED_TIME_VALUE
} from '../src/ddf-rules/registry';
import {allRules} from '../src/ddf-rules';
import {Issue} from '../src/ddf-rules/issue';

const expect = chai.expect;

describe('rules for data points', () => {
  let ddfDataSet = null;

  describe('when data set is correct (\'fixtures/good-folder\')', () => {
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
    it(`an issue should be found for rule 'DATA_POINT_VALUE_NOT_NUMERIC'
   (fixtures/rules-cases/data-point-value-not-num)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-value-not-num', null);
      ddfDataSet.load(() => {
        const dataPointValueNotNumRule = allRules[MEASURE_VALUE_NOT_NUMERIC].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors);
        const expectedFileName = 'ddf--datapoints--pop--by--country--year.csv';
        const expectedMeasure = 'pop';
        const expectedLine = 2;
        const expectedValue = 'huge';

        ddfDataSet.getDataPoint().loadFile(fileDescriptor,
          (record, line) => {
            const issues: Array<Issue> = dataPointValueNotNumRule({ddfDataSet, fileDescriptor, record, line});
            const issue = head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(MEASURE_VALUE_NOT_NUMERIC);
            expect(issue.path.endsWith(expectedFileName)).to.be.true;
            expect(!!issue.data).to.be.true;
            expect(issue.data.measure).to.equal(expectedMeasure);
            expect(issue.data.line).to.equal(expectedLine);
            expect(issue.data.value).to.equal(expectedValue);
          },
          () => done()
        );
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_UNEXPECTED_ENTITY_VALUE'
   (fixtures/rules-cases/data-point-unexpected-entity-value)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-entity-value', null);
      ddfDataSet.load(() => {
        const dataPointUnexpectedConceptRule = allRules[DATA_POINT_UNEXPECTED_ENTITY_VALUE].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors);
        const expectedFileName = 'ddf--datapoints--pop--by--country--year.csv';
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
            expect(issue.path.endsWith(expectedFileName)).to.be.true;
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
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-time-value', null);
      ddfDataSet.load(() => {
        const dataPointUnexpectedTimeRule = allRules[DATA_POINT_UNEXPECTED_TIME_VALUE].recordRule;
        const fileDescriptor = head(ddfDataSet.getDataPoint().fileDescriptors);
        const expectedFileName = 'ddf--datapoints--pop--by--country--year.csv';
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
            expect(issue.path.endsWith(expectedFileName)).to.be.true;
            expect(!!issue.data).to.be.true;
            expect(issue.data.concept).to.equal(expectedConcept);
            expect(issue.data.line).to.equal(expectedLine);
            expect(issue.data.value).to.equal(expectedValue);
          },
          () => done()
        );
      });
    });
  });
});
