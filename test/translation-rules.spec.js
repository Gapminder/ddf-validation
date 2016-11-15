'use strict';

const _ = require('lodash');
const async = require('async');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const api = require('../index');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const translationRules = require('../lib/ddf-rules/translation-rules');
const expect = chai.expect;

const CONCURRENT_OPERATIONS_AMOUNT = 30;

chai.use(sinonChai);

/*eslint-disable camelcase*/

describe('translation rules', () => {
  describe('when "UNEXPECTED_TRANSLATION_HEADER" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/dummy-companies)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies');

      ddfDataSet.load(() => {
        const results = translationRules[rulesRegistry.UNEXPECTED_TRANSLATION_HEADER](ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`expected issues should be found for folder with the problem
   (fixtures/rules-cases/unexpected-translation-header)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-translation-header');

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_LENGTH = 2;
        const results = translationRules[rulesRegistry.UNEXPECTED_TRANSLATION_HEADER](ddfDataSet);
        const EXPECTED_RESULTS = [{
          path: 'ddf--datapoints--company_size_string--by--company--anno.csv',
          data: {
            reason: 'non consistent primary key',
            primaryKey: ['company', 'anno'],
            translationHeaders: ['anno', 'company_size_string']
          }
        }, {
          path: 'ddf--entities--company.csv',
          data: {
            reason: 'extra data in translation',
            ddfFileHeaders: ['company', 'name', 'country', 'region'],
            translationHeaders: ['company', 'country', 'foo']
          }
        }];

        expect(results.length).to.equal(EXPECTED_ISSUES_LENGTH);

        results.forEach((result, index) => {
          expect(result.type).to.equal(rulesRegistry.UNEXPECTED_TRANSLATION_HEADER);
          expect(_.endsWith(result.path, EXPECTED_RESULTS[index].path)).to.be.true;
          expect(_.isEqual(result.data, EXPECTED_RESULTS[index].data)).to.be.true;
        });

        done();
      });
    });
  });

  describe('when "UNEXPECTED_TRANSLATIONS_DATA" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/dummy-companies)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies');

      ddfDataSet.load(() => {
        const results = translationRules[rulesRegistry.UNEXPECTED_TRANSLATIONS_DATA](ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`expected issues should be found for folder with the problem
     (fixtures/rules-cases/unexpected-translations-data)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-translations-data');

      ddfDataSet.load(() => {
        const results = translationRules[rulesRegistry.UNEXPECTED_TRANSLATIONS_DATA](ddfDataSet);
        const EXPECTED_RESULT = {
          path: 'ddf--entities--company.csv',
          data: {
            record: {
              company: '',
              country: 'Verenigde Staten van Amerika'
            },
            primaryKey: 'company'
          }
        };

        expect(results.length).to.equal(1);

        const result = _.head(results);

        expect(result.type).to.equal(rulesRegistry.UNEXPECTED_TRANSLATIONS_DATA);
        expect(_.endsWith(result.path, EXPECTED_RESULT.path)).to.be.true;
        expect(result.data.record.company).to.equal(EXPECTED_RESULT.data.record.company);
        expect(result.data.record.country).to.equal(EXPECTED_RESULT.data.record.country);
        expect(result.data.primaryKey).to.equal(EXPECTED_RESULT.data.primaryKey);

        done();
      });
    });
  });

  describe('when "UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA" rule', () => {
    it('any issue should NOT be found for "fixtures/dummy-companies"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies');
      const tempResults = [];

      ddfDataSet.load(() => {
        const actions = _.flattenDeep(
          ddfDataSet.getDataPoint().fileDescriptors
            .map(fileDescriptor =>
              fileDescriptor.getExistingTranslationDescriptors()
                .map(transDescriptor => {
                  transDescriptor.primaryKey = fileDescriptor.primaryKey;

                  return api.createDatapointTranslationByRuleProcessor(
                    {
                      ddfDataSet,
                      ruleKey: rulesRegistry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA,
                      issuesFilter: {isAllowed: () => true}
                    },
                    transDescriptor,
                    result => {
                      tempResults.push(result);
                    }
                  );
                })
            )
        );

        async.parallelLimit(actions, CONCURRENT_OPERATIONS_AMOUNT, () => {
          const results = _.compact(tempResults);

          expect(_.isEmpty(results)).to.be.true;

          done();
        });
      });
    });
  });

  describe('when "UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA" rule', () => {
    it('any issue should NOT be found for "fixtures/rules-cases/unexpected-data-point-translations-data"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data-point-translations-data');
      const tempResults = [];

      ddfDataSet.load(() => {
        const actions = _.flattenDeep(
          ddfDataSet.getDataPoint().fileDescriptors
            .map(fileDescriptor =>
              fileDescriptor.getExistingTranslationDescriptors()
                .map(transDescriptor => {
                  transDescriptor.primaryKey = fileDescriptor.primaryKey;

                  return api.createDatapointTranslationByRuleProcessor(
                    {
                      ddfDataSet,
                      ruleKey: rulesRegistry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA,
                      issuesFilter: {isAllowed: () => true}
                    },
                    transDescriptor,
                    result => {
                      tempResults.push(result);
                    }
                  );
                })
            )
        );

        async.parallelLimit(actions, CONCURRENT_OPERATIONS_AMOUNT, () => {
          const results = _.compact(tempResults);
          const EXPECTED_RESULT = {
            path: 'lang/nl-nl/ddf--datapoints--company_size_string--by--company--anno.csv',
            data: {
              record: {company: '', anno: '2015', company_size_string: 'groot'},
              primaryKey: ['company', 'anno']
            }
          };

          expect(results.length).to.equal(1);

          const result = _.head(results);

          expect(result.type).to.equal(rulesRegistry.UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA);
          expect(_.endsWith(result.path, EXPECTED_RESULT.path)).to.be.true;
          expect(_.isEqual(result.data, EXPECTED_RESULT.data)).to.be.true;

          done();
        });
      });
    });
  });
});
