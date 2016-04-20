'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');

chai.use(sinonChai);

describe('DDF data', () => {
  describe('when data is correct', () => {
    let ddfDataSet = null;

    beforeEach(done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');
      ddfDataSet.load(() => {
        done();
      });
    });

    afterEach(done => {
      ddfDataSet.dismiss(() => {
        done();
      });
    });

    it('non-DDF directory descriptors should NOT be present', () => {
      expect(ddfDataSet.ddfRoot.getNonDdfDirectoriesDescriptors().length).to.equal(0);
    });
  });

  describe('when data is incorrect', () => {
    let ddfData = null;

    beforeEach(done => {
      ddfData = new DdfDataSet('./test/fixtures/bad-folder');
      ddfData.load(() => {
        done();
      });
    });

    afterEach(done => {
      ddfData.dismiss(() => {
        done();
      });
    });

    it('non-DDF directory descriptors should be present', () => {
      expect(ddfData.ddfRoot.getNonDdfDirectoriesDescriptors().length).to.be.greaterThan(0);
    });
  });
});
