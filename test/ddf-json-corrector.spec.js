'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
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
      const correctedCsvContent = '"concept","name","concept_type","domain","indicator_url","color","scales",' +
        '"drill_up","unit","interpolation","description"\n"geographic_regions","Geographic regions","entity_set",' +
        '"geo","http://spreadsheets.google.com/pub?key=phT4mwjvEuGBtdf1ZeO7_PQ","{""selectable"":false,' +
        '""palette"":{""sub_saharan_africa"":""#4e7af0"",""east_asia_pacific"":""#f03838"",""america"":""#ebcc21"",' +
        '""south_asia"":""#35d1d1"",""middle_east_north_africa"":""#5be56b"",""europe_central_asia"":""#f49d37""}}",' +
        '"[""ordinal""]",,,,\n"sg_gdp_p_cap_const_ppp2011_dollar","sg_gdp_p_cap_const_ppp2011_dollar","measure",,' +
        '"http://www.gapminder.org/news/data-sources-dont-panic-end-poverty","{""palette"":{""0"":""#62CCE3"",' +
        '""1"":""#B4DE79"",""2"":""#E1CE00"",""3"":""#F77481""}}","some text[\'log\', \'linear\']",,,"exp",';

      ddfJsonCorrector.correct((correctorError, csvFileDescriptors) => {
        expect(csvFileDescriptors.length).to.equal(1);

        const csvFileDescriptor = _.head(csvFileDescriptors);

        expect(csvFileDescriptor.csv).to.equal(correctedCsvContent);

        done();
      });
    });
  });
});
