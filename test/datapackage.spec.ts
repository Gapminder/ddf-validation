import * as chai from 'chai';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('datapackage validation', () => {
  describe('when "ddf--unpop--wpp_population" dataset', () => {
    it('should datapackage be created properly', done => {
      const dataPackageTemplate = require('./fixtures/data-package/ddf--unpop--wpp_population/datapackage.template.json');
      const ddfDataSet = new DdfDataSet('./test/fixtures/data-package/ddf--unpop--wpp_population/', null, true);

      ddfDataSet.createDataPackage(() => {
        try {
          expect(ddfDataSet.dataPackageDescriptor.getDataPackageObject()).to.deep.equal(dataPackageTemplate);

          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('when "ddf--bubbles-3" dataset', () => {
    it('should datapackage be created properly with non strict ddf file names', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/ddf--bubbles-3', null, true);

      ddfDataSet.createDataPackage(() => {
        const EXPECTED_RESOURCES_LENGTH = 3;

        try {
          expect(!!ddfDataSet.getDataPackageResources()).to.be.true;
          expect(ddfDataSet.getDataPackageResources().length).to.equal(EXPECTED_RESOURCES_LENGTH);

          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('when "ddf--ws--testing" dataset', () => {
    it('should datapackage be created properly', done => {
      const expectedDatapackage = require('./fixtures/results/datapackage/ddf--ws--testing.json');
      const ddfDataSet = new DdfDataSet('./test/fixtures/ddf--ws--testing', null, true);

      ddfDataSet.createDataPackage(() => {
        try {
          expect(ddfDataSet.getDataPackageResources()).to.deep.equal(expectedDatapackage.resources);
          expect(ddfDataSet.getDataPackageSchema()).to.deep.equal(expectedDatapackage.ddfSchema);

          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  describe('synonyms supporting', () => {
    it('should datapackage be created properly', done => {
      const expectedDatapackage = require('./fixtures/ddf--gapminder--geo_entity_domain/datapackage.json');
      const ddfDataSet = new DdfDataSet('./test/fixtures/ddf--gapminder--geo_entity_domain', null, true);

      ddfDataSet.createDataPackage(() => {
        try {
          expect(ddfDataSet.getDataPackageResources()).to.deep.equal(expectedDatapackage.resources);
          expect(ddfDataSet.getDataPackageSchema()).to.deep.equal(expectedDatapackage.ddfSchema);

          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
