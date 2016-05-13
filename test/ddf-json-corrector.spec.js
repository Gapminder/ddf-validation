'use strict';
const _ = require('lodash');
const diff = require('deep-diff').diff;
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const utils = require('./test-utils');
const DdfJsonCorrector = require('../lib/ddf-definitions/ddf-json-corrector');

chai.use(sinonChai);

describe('ddf json corrector', () => {
  describe('when wrong json is NOT found', () => {
    const dummyCompaniesPath = './test/fixtures/dummy-companies';
    const ddfJsonCorrector = new DdfJsonCorrector(dummyCompaniesPath);

    it('there should be no errors', done => {
      ddfJsonCorrector.correct(correctorError => {
        expect(correctorError).to.be.null;

        done();
      });
    });

    it('file descriptors with CSV content should NOT be found', done => {
      ddfJsonCorrector.correct((correctorError, csvFileDescriptors) => {
        expect(csvFileDescriptors.length).to.equal(0);

        done();
      });
    });
  });

  describe('when wrong json is found in (fixtures/rules-cases/incorrect-json-field)', () => {
    const expectedPath = './test/fixtures/rules-cases/incorrect-json-field';
    const ddfJsonCorrector = new DdfJsonCorrector(expectedPath);

    it('there should be no errors', done => {
      ddfJsonCorrector.correct(correctorError => {
        expect(correctorError).to.be.null;

        done();
      });
    });

    it('expected file descriptor with CSV content should be found', done => {
      ddfJsonCorrector.correct((correctorError, csvFileDescriptors) => {
        expect(csvFileDescriptors.length).to.equal(1);

        const csvFileDescriptor = _.head(csvFileDescriptors);

        utils.csvToJsonByString(csvFileDescriptor.csv, (csvConvertError, expectedJsonContent) => {
          expect(csvConvertError).to.be.null;

          const differences = diff(expectedJsonContent, ddfJsonCorrector.jsonContent);

          expect(!!differences).to.be.false;

          done();
        });
      });
    });
  });
});
