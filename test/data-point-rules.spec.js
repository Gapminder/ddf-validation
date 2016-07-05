'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const dataPointsRules = require('../lib/ddf-rules/data-point-rules');
const expect = chai.expect;

chai.use(sinonChai);
describe('rules for data points', () => {
  let ddfDataSet = null;

  describe('when data set is correct (\'fixtures/good-folder\')', () => {
    ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

    Object.getOwnPropertySymbols(dataPointsRules).forEach(dataPointRuleKey => {
      it(`any issue should NOT be found for rule ${Symbol.keyFor(dataPointRuleKey)}`, done => {
        ddfDataSet.load(() => {
          const dataPointDetail = ddfDataSet.getDataPoint().details[0];

          ddfDataSet.getDataPoint().loadDetail(
            dataPointDetail,
            (dataPointRecord, line) => {
              expect(dataPointsRules[dataPointRuleKey]({
                ddfDataSet,
                dataPointDetail,
                dataPointRecord,
                line
              }).length).to.equal(0);
            },
            () => done()
          );
        });
      });
    });
  });

  describe('when data set is NOT correct', () => {
    afterEach(done => {
      ddfDataSet.dismiss(() => {
        done();
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_VALUE_NOT_NUMERIC'
   (fixtures/rules-cases/data-point-value-not-num)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-value-not-num');
      ddfDataSet.load(() => {
        const dataPointValueNotNumRule = dataPointsRules[rulesRegistry.MEASURE_VALUE_NOT_NUMERIC];
        const dataPointDetail = ddfDataSet.getDataPoint().details[0];
        const expectedFileName = 'ddf--datapoints--pop--by--country--year.csv';
        const expectedMeasure = 'pop';
        const expectedLine = 2;
        const expectedValue = 'huge';

        ddfDataSet.getDataPoint().loadDetail(dataPointDetail,
          (dataPointRecord, line) => {
            const issues = dataPointValueNotNumRule({ddfDataSet, dataPointDetail, dataPointRecord, line});
            const issue = _.head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(rulesRegistry.MEASURE_VALUE_NOT_NUMERIC);
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
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-entity-value');
      ddfDataSet.load(() => {
        const dataPointUnexpectedConceptRule =
          dataPointsRules[rulesRegistry.DATA_POINT_UNEXPECTED_ENTITY_VALUE];
        const dataPointDetail = ddfDataSet.getDataPoint().details[0];
        const expectedFileName = 'ddf--datapoints--pop--by--country--year.csv';
        const expectedConcept = 'country';
        const expectedLine = 2;
        const expectedValue = 'non-usa';

        ddfDataSet.getDataPoint().loadDetail(
          dataPointDetail,
          (dataPointRecord, line) => {
            const issues = dataPointUnexpectedConceptRule({ddfDataSet, dataPointDetail, dataPointRecord, line});
            const issue = _.head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(rulesRegistry.DATA_POINT_UNEXPECTED_ENTITY_VALUE);
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
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-time-value');
      ddfDataSet.load(() => {
        const dataPointUnexpectedTimeRule =
          dataPointsRules[rulesRegistry.DATA_POINT_UNEXPECTED_TIME_VALUE];
        const dataPointDetail = ddfDataSet.getDataPoint().details[0];
        const expectedFileName = 'ddf--datapoints--pop--by--country--year.csv';
        const expectedConcept = 'year';
        const expectedLine = 2;
        const expectedValue = '1960wfoo';

        ddfDataSet.getDataPoint().loadDetail(
          dataPointDetail,
          (dataPointRecord, line) => {
            const issues = dataPointUnexpectedTimeRule({ddfDataSet, dataPointDetail, dataPointRecord, line});
            const issue = _.head(issues);

            expect(issues.length).to.equal(1);
            expect(issue.type).to.equal(rulesRegistry.DATA_POINT_UNEXPECTED_TIME_VALUE);
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
