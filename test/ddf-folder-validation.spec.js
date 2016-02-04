'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const normilezePath = require('../utils/path-normilize');

let ddfFolderValidation = require('../lib/ddf-root-folder.validator');
let logger = require('../utils/logger');

describe('ddf-folder-validation', () => {
  before(()=> sinon.stub(logger, 'log', ()=>{}));
  after(()=> logger.log.restore());

  describe(`when path doesn't exists or not a folder`, () => {
    before(()=> logger.log.reset());
    const folder = normilezePath('../test/fixtures/folders/not-exists');
    it('should be not valid ddf-folder', () => expect(ddfFolderValidation(folder)).to.be.falsy);
    it('should print one err_folder_not_found error message', () => {
      expect(logger.log).to.have.been.calledOnce;
      expect(logger.log).to.have.been.calledWithMatch(`Given folder doesn't exist`);
    })
  });

  describe(`when path not a ddf folder and there are no subfolders`, () => {
    before(()=> logger.log.reset());

    const folder = normilezePath('test/fixtures/folders/empty-folder');
    it('should be not valid ddf-folder', () => expect(ddfFolderValidation(folder)).to.be.falsy);
    it('should print 2 error messages', () => expect(logger.log).to.have.been.calledTwice);
    it('should print err_folder_is_not_ddf_folder error message', () =>
      expect(logger.log.getCall(0)).to.have.been.calledWithMatch(`is not a ddf-folder`));
    it('should print err_folder_has_no_subfolders error message', () =>
      expect(logger.log.getCall(1)).to.have.been.calledWithMatch(`Given folder doesn't contain any sub folders`))
  });

  describe(`when path not a ddf folder and doesn't have ddf subfolders`, () => {
    before(()=> logger.log.reset());
    const folder = normilezePath('test/fixtures/folders/subfolders');
    it('should be not valid ddf-folder', () => expect(ddfFolderValidation(folder)).to.be.falsy);
    it('should print 2 error messages', () => expect(logger.log).to.have.been.calledTwice);
    it('should print err_folder_is_not_ddf_folder error message', () =>
      expect(logger.log.getCall(0)).to.have.been.calledWithMatch(`is not a ddf-folder`));
    it('should print err_folder_has_no_ddf_subfolders error message', () =>
      expect(logger.log.getCall(1)).to.have.been.calledWithMatch(`doesn't contain any ddf subdolders`))
  });

  describe(`when path is ddf folder`, () => {
    before(()=> logger.log.reset());
    const folder = normilezePath('test/fixtures/folders/ddf-folder');
    it('should be valid', () => expect(ddfFolderValidation(folder)).to.be.truthy);
    it('should not print error messages', () => expect(logger.log).to.not.have.been.called);
  });

  describe(`when path has ddf subfolders`, () => {
    before(()=> logger.log.reset());
    const folder = normilezePath('test/fixtures/folders/ddf-subfolders');
    it('should be valid', () => expect(ddfFolderValidation(folder)).to.be.truthy);
    it('should not print error messages', () => expect(logger.log).to.not.have.been.called);
  });
});

//ddfFolderValidation(pathNormilize('./test/fixtures/folders/empty-folder'));
//ddfFolderValidation(pathNormilize('./test/fixtures/folders/subfolders'));
//ddfFolderValidation(pathNormilize('./test/fixtures/folders/ddf-folder'));
//ddfFolderValidation(pathNormilize('./test/fixtures/folders/ddf-subfolders'));