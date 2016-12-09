import * as chai from 'chai';
import {head} from 'lodash';
import {diff} from 'deep-diff';
import {csvToJsonByString} from './test-utils';
import {DdfJsonCorrector} from '../src/ddf-definitions/ddf-json-corrector';

const expect = chai.expect;

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

        const csvFileDescriptor: any = head(csvFileDescriptors);

        csvToJsonByString(csvFileDescriptor.csv, (csvConvertError, expectedJsonContent) => {
          expect(csvConvertError).to.be.null;

          const differences = diff(expectedJsonContent, ddfJsonCorrector.jsonContent);

          expect(!!differences).to.be.false;

          done();
        });
      });
    });
  });
});
