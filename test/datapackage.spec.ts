import * as chai from 'chai';
import { isEqual } from 'lodash';
import { DataPackage } from '../src/data/data-package';

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('datapackage validation', () => {
  describe('when "ddf--unpop--wpp_population" dataset', () => {
    it('should datapackage be created propery', done => {
      const dataPackageTemplate = require('./fixtures/data-package/ddf--unpop--wpp_population/datapackage.template.json');
      const dataPackage = new DataPackage('./test/fixtures/data-package/ddf--unpop--wpp_population/', {});

      dataPackage.take(dataPackageObject => {
        expect(isEqual(dataPackageObject, dataPackageTemplate)).to.be.true;

        done();
      }, true);
    });
  });
  describe('when "ddf--bubbles-3" dataset', () => {
    it('should datapackage be created propery with non strict ddf file names', done => {
      const dataPackage = new DataPackage('./test/fixtures/ddf--bubbles-3/', {});

      dataPackage.take(dataPackageObject => {
        const EXPECTED_RESOURCES_LENGTH = 3;

        expect(!!dataPackageObject.resources).to.be.true;
        expect(dataPackageObject.resources.length).to.equal(EXPECTED_RESOURCES_LENGTH);

        done();
      }, true);
    });
  });
});
