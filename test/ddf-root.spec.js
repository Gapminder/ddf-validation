'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const DDFRoot = require('../lib/data/root');

describe('ddf root folder validation', () => {

  describe(`when bad folder`, () => {
    const ddfRoot = new DDFRoot('./test/fixtures/bad-folder');

    it('ddf folders should not be defined', done => {
      ddfRoot.check(() => {
        expect(ddfRoot.getDdfDirectoriesDescriptors().length)
          .to.equal(0);
        done();
      });
    });

    it('count of non-ddf folders should be equal count of all folders', done => {
      ddfRoot.check(() => {
        expect(ddfRoot.getNonDdfDirectoriesDescriptors().length)
          .to.equal(ddfRoot.directoryDescriptors.length);
        done();
      });
    });
  });

  describe(`when good folder`, () => {
    it('count of ddf folders should be 1', done => {
      const ddfRoot = new DDFRoot('./test/fixtures/good-folder');
      ddfRoot.check(() => {
        expect(ddfRoot.getDdfDirectoriesDescriptors().length)
          .to.equal(1);
        done();
      });
    });
  });

  describe(`when good folder with sub-folders`, () => {
    it('count of ddf folders should be greater than 1', done => {
      const ddfRoot = new DDFRoot('./test/fixtures/good-folder-with-subfolders');
      ddfRoot.check(() => {
        expect(ddfRoot.getDdfDirectoriesDescriptors().length)
          .to.be.greaterThan(1);
        done();
      });
    });
  });
});