import * as chai from 'chai';
import {isEqual, isEmpty} from 'lodash';
import {CsvChecker} from '../src/data/csv-checker';

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('csv checker', () => {
  it('should be no errors for correct csv file', done => {
    const csvChecker = new CsvChecker('./test/fixtures/good-folder/ddf--concepts.csv');

    csvChecker.check(() => {
      expect(csvChecker.isCorrect()).to.be.true;
      expect(isEmpty(csvChecker.errors)).to.be.true;

      done();
    });
  });

  it('should be no errors for correct csv file', done => {
    const csvChecker = new CsvChecker('./test/fixtures/csv/bad.csv');
    const expectedErrors = [{
      message: 'Too few fields: expected 3 fields but parsed 1',
      row: 1,
      type: 'FieldMismatch/TooFewFields',
      data: {aaa: '444'}
    },
      {
        message: 'Too few fields: expected 3 fields but parsed 2',
        row: 2,
        type: 'FieldMismatch/TooFewFields',
        data: {aaa: '555', bbb: '777'}
      },
      {
        message: 'Too few fields: expected 3 fields but parsed 1',
        row: 3,
        type: 'FieldMismatch/TooFewFields',
        data: {aaa: 'foo'}
      }];

    csvChecker.check(() => {
      expect(csvChecker.isCorrect()).to.be.false;
      expect(isEqual(csvChecker.errors, expectedErrors)).to.be.true;

      done();
    });
  });
});
