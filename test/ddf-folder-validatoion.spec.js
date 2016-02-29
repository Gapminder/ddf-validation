'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const normilezePath = require('../utils/path-normilize');
const utils = require('../utils');
const logger = utils.getLogger();
const DdfRootFolderValidator = require('../lib/ddf-root-folder.validator.js');
const ddfValidateOneFolder = require('../lib/ddf-validate-folder');

describe('ddf folder validation', () => {
  before(() => sinon.stub(logger, 'log', () => {
  }));
  after(() => logger.log.restore());


  describe(`when good path with some warnings`, () => {
    afterEach(() => logger.log.reset());

    const folder = normilezePath('./test/fixtures/folders/ddf-folder');
    const ddfRootFolderValidator = new DdfRootFolderValidator(logger, folder);

    it(`should be 1 record with warning`, done => {
      ddfValidateOneFolder(logger, ddfRootFolderValidator.ddfFolders$)
        .subscribe(
          x => {
            const res = x.filter(r => r.isValid === false && r.fileName === 'ddf--dimensions.csv');
            expect(res.length).to.equal(1);
            done();
          });
    });

    it(`should be 2 positive records`, done => {
      ddfValidateOneFolder(logger, ddfRootFolderValidator.ddfFolders$)
        .subscribe(
          x => {
            const res = x.filter(r => r.valid === true && (r.fileName === 'ddf--dimensions.csv,ddf--measures.csv' || r.fileName === 'ddf--measures.csv'));
            expect(res.length).to.equal(2);
            done();
          });
    });
  });
});
