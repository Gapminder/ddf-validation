import * as chai from 'chai';
import { DataPackage } from '../src/data/data-package';

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('datapackage validation', () => {
  describe('when "ddf--unpop--wpp_population" dataset', () => {
    it('should datapackage be created properly', done => {
      const dataPackageTemplate = require('./fixtures/data-package/ddf--unpop--wpp_population/datapackage.template.json');
      const dataPackage = new DataPackage('./test/fixtures/data-package/ddf--unpop--wpp_population/', {});

      dataPackage.take(dataPackageObject => {
        expect(dataPackageObject).to.deep.equal(dataPackageTemplate);

        done();
      }, true);
    });
  });
  describe('when "ddf--bubbles-3" dataset', () => {
    it('should datapackage be created properly with non strict ddf file names', done => {
      const dataPackage = new DataPackage('./test/fixtures/ddf--bubbles-3/', {});

      dataPackage.take(dataPackageObject => {
        const EXPECTED_RESOURCES_LENGTH = 3;

        expect(!!dataPackageObject.resources).to.be.true;
        expect(dataPackageObject.resources.length).to.equal(EXPECTED_RESOURCES_LENGTH);

        done();
      }, true);
    });
  });
  describe('when "ddf--ws--testing" dataset', () => {
    it('should datapackage be created properly', done => {
      const expectedDatapackage = require('./fixtures/results/datapackage/ddf--ws--testing.json');
      const dataPackage = new DataPackage('./test/fixtures/ddf--ws--testing/', {});

      dataPackage.take(dataPackageObject => {
        expect(dataPackageObject).to.deep.equal(expectedDatapackage);

        done();
      }, true);
    });
  });
});
