'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const CsvChecker = require('../lib/data/csv-checker');

chai.use(sinonChai);

describe('csv checker', () => {
  it('should be no errors for correct csv file', done => {
    const csvChecker = new CsvChecker('./test/fixtures/good-folder/ddf--concepts.csv');

    csvChecker.check(() => {
      expect(csvChecker.isCorrect()).to.be.true;
      expect(_.isEmpty(csvChecker.errors)).to.be.true;

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
      expect(_.isEqual(csvChecker.errors, expectedErrors)).to.be.true;

      done();
    });
  });
});
