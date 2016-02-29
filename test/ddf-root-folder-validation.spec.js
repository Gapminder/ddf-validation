'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

const normilezePath = require('../utils/path-normilize');
const utils = require('../utils');
const logger = utils.getLogger();
const DdfRootFolderValidator = require('../lib/ddf-root-folder.validator.js');

describe('ddf root folder validation', () => {

  describe(`when wrong path`, () => {
    before(() => sinon.stub(logger, 'error', () => {
    }));
    after(() => logger.error.restore());

    describe(`and folder not exists`, () => {
      afterEach(() => logger.error.reset());

      const folder = normilezePath('./test/fixtures/folders/not-exists');

      it(`ddfFolders$ should be undefined`,
        () => {
          const ddfRootFolderValidator = new DdfRootFolderValidator(logger, folder);
          expect(ddfRootFolderValidator.ddfFolders$).to.equal(undefined);
        });

      it(`should print 'Given folder doesn't exist'`,
        () => {
          new DdfRootFolderValidator(logger, folder);
          expect(logger.error).to.have.been.calledWithMatch(`Given folder doesn't exist`);
        });
    });

    describe(`and folder is a file`, () => {
      afterEach(() => logger.error.reset());

      const folder = normilezePath('./test/fixtures/files/empty-file');

      it(`ddfFolders$ should be undefined`, () => {
        const ddfRootFolderValidator = new DdfRootFolderValidator(logger, folder);
        expect(ddfRootFolderValidator.ddfFolders$).to.equal(undefined);
      });

      it(`should print 'Given folder doesn't exist'`, () => {
        new DdfRootFolderValidator(logger, folder);
        expect(logger.error).to.have.been.calledWithMatch(`Given folder doesn't exist`);
      });
    });

    describe(`and empty folder`, () => {
      afterEach(() => logger.error.reset());

      const folder = normilezePath('./test/fixtures/folders/empty-folder');
      const ddfRootFolderValidator = new DdfRootFolderValidator(logger, folder);
      const ddfRootValidatorObserver = ddfRootFolderValidator.getValidator();

      it(`should call twice`, done => {
        ddfRootValidatorObserver
          .subscribe(res => {
            DdfRootFolderValidator.validate(ddfRootFolderValidator)(res);
            expect(logger.error).to.have.been.calledTwice;
            done();
          });
      });

      it(`should print 'is not a ddf-folder'`, done => {
        ddfRootValidatorObserver
          .subscribe(res => {
            DdfRootFolderValidator.validate(ddfRootFolderValidator)(res);

            expect(logger.error.getCall(0)).to.have.been.calledWithMatch(`is not a ddf-folder`);
            done();
          });
      });

      it(`should print 'Given folder doesn't contain any sub folders'`, done => {
        ddfRootValidatorObserver
          .subscribe(res => {
            DdfRootFolderValidator.validate(ddfRootFolderValidator)(res);

            expect(logger.error.getCall(1)).to.have.been.calledWithMatch(`Given folder doesn't contain any sub folders`);
            done();
          });
      });
    });
  });

  describe(`when good path`, () => {
    before(() => sinon.stub(logger, 'notice', () => {
    }));
    after(() => logger.notice.restore());

    describe(`found 2 ddf subfolders`, () => {
      afterEach(() => logger.notice.reset());

      const folder = normilezePath('./test/fixtures/folders/ddf-subfolders');
      const ddfRootFolderValidator = new DdfRootFolderValidator(logger, folder);
      const ddfRootValidatorObserver = ddfRootFolderValidator.getValidator();

      it(`ddfFolders$ should be object`, done => {
        ddfRootValidatorObserver
          .subscribe(res => {
            DdfRootFolderValidator.validate(ddfRootFolderValidator)(res);

            expect(ddfRootFolderValidator.ddfFolders$).to.be.an('object');
            done();
          });
      });

      it(`should print 'Found 2 DDF folders'`, done => {
        ddfRootValidatorObserver
          .subscribe(res => {
            DdfRootFolderValidator.validate(ddfRootFolderValidator)(res);

            expect(logger.notice).to.have.been.calledWithMatch(`Found 2 DDF folders`);
            done();
          });
      });
    });

    describe(`found ddf folder`, () => {
      afterEach(() => logger.notice.reset());

      const folder = normilezePath('./test/fixtures/folders/ddf-folder');
      const ddfRootFolderValidator = new DdfRootFolderValidator(logger, folder);
      const ddfRootValidatorObserver = ddfRootFolderValidator.getValidator();

      it(`ddfFolders$ should be object`, done => {
        ddfRootValidatorObserver
          .subscribe(res => {
            DdfRootFolderValidator.validate(ddfRootFolderValidator)(res);

            expect(ddfRootFolderValidator.ddfFolders$).to.be.an('object');
            done();
          });
      });

      it(`should print 'Found 1 DDF folder'`, done => {
        ddfRootValidatorObserver
          .subscribe(res => {
            DdfRootFolderValidator.validate(ddfRootFolderValidator)(res);

            expect(logger.notice).to.have.been.calledWithMatch(`Found 1 DDF folder`);
            done();
          });
      });
    });
  });
});
