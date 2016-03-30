'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const DdfData = require('../lib/ddf-definitions/ddf-data');

chai.use(sinonChai);

describe('DDF data', () => {
  describe('when data is correct', () => {
    let ddfData = null;

    beforeEach(done => {
      ddfData = new DdfData('./test/fixtures/good-folder');
      ddfData.load(() => {
        done();
      });
    });

    afterEach(done => {
      ddfData.dismiss(() => {
        done();
      });
    });

    it('non-DDF directory descriptors should NOT be present', () => {
      expect(ddfData.ddfRoot.getNonDdfDirectoriesDescriptors().length).to.equal(0);
    });
  });

  describe('when data is incorrect', () => {
    let ddfData = null;

    beforeEach(done => {
      ddfData = new DdfData('./test/fixtures/bad-folder');
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
