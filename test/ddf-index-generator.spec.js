'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const DdfIndexGenerator = require('../lib/ddf-definitions/ddf-index-generator');

chai.use(sinonChai);

describe('ddf index generator', () => {
  describe('when dummy companies data set is correct', () => {
    const EXPECTED_INDEX_RECORDS_COUNT = 15;
    const dummyCompaniesPath = './test/fixtures/dummy-companies';

    it(`json content length should be expected (${EXPECTED_INDEX_RECORDS_COUNT})`, done => {
      const ddfIndexGenerator = new DdfIndexGenerator(dummyCompaniesPath);

      ddfIndexGenerator.getJson(jsonContent => {
        expect(jsonContent).to.be.not.null;
        expect(jsonContent.length).to.equal(EXPECTED_INDEX_RECORDS_COUNT);

        done();
      });
    });

    it('type of csv content should be "string" and csv content should NOT be empty', done => {
      const ddfIndexGenerator = new DdfIndexGenerator(dummyCompaniesPath);

      ddfIndexGenerator.getCsv((err, csvContent) => {
        expect(!!err).to.be.false;
        expect(typeof csvContent).to.equal('string');
        expect(csvContent.length).to.be.greaterThan(0);

        done();
      });
    });
  });
});
