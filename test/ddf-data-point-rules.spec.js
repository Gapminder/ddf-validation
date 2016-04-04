'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfData = require('../lib/ddf-definitions/ddf-data');
const rulesRegistry = require('../lib/ddf-rules/registry');
const dataPointsRules = require('../lib/ddf-rules/data-point-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('rules for data points', () => {
  let ddfData = null;

  describe('when "DATA_POINT_VALUE_NOT_NUMERIC" rule', () => {
    afterEach(done => {
      ddfData.dismiss(() => {
        done();
      });
    });

    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfData = new DdfData('./test/fixtures/good-folder');
      ddfData.load(() => {
        const dataPointValueNotNumRule = dataPointsRules[rulesRegistry.DATA_POINT_VALUE_NOT_NUMERIC];
        const expectedDataPointDetail = ddfData.getDataPoint().details[0];

        ddfData.getDataPoint().loadDetail(expectedDataPointDetail, () => {
          expect(dataPointValueNotNumRule(ddfData, expectedDataPointDetail).length).to.equal(0);

          done();
        });
      });
    });

    it(`an issue should be found for folder with the problem
     (fixtures/rules-cases/data-point-value-not-num)`, done => {
      ddfData = new DdfData('./test/fixtures/rules-cases/data-point-value-not-num');
      ddfData.load(() => {
        const dataPointValueNotNumRule = dataPointsRules[rulesRegistry.DATA_POINT_VALUE_NOT_NUMERIC];
        const expectedDataPointDetail = ddfData.getDataPoint().details[0];
        const expectedFileName = 'ddf--datapoints--pop--by--country--year.csv';
        const expectedMeasure = 'pop';
        const expectedLine = 2;
        const expectedValue = 'huge';

        ddfData.getDataPoint().loadDetail(expectedDataPointDetail, () => {
          const issues = dataPointValueNotNumRule(ddfData, expectedDataPointDetail);

          expect(issues.length).to.equal(1);
          expect(issues[0].type).to.equal(rulesRegistry.DATA_POINT_VALUE_NOT_NUMERIC);
          expect(issues[0].path.endsWith(expectedFileName)).to.be.true;
          expect(!!issues[0].data).to.be.true;
          expect(issues[0].data.measure).to.equal(expectedMeasure);
          expect(issues[0].data.line).to.equal(expectedLine);
          expect(issues[0].data.value).to.equal(expectedValue);

          done();
        });
      });
    });
  });
});
