'use strict';
const _ = require('lodash');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const DdfDataSet = require('../lib/ddf-definitions/ddf-data-set');
const rulesRegistry = require('../lib/ddf-rules/registry');
const generalRules = require('../lib/ddf-rules/general-rules');
const expect = chai.expect;

chai.use(sinonChai);

describe('general rules', () => {
  describe('when DDF folder is correct', () => {
    const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

    it('there should be no issues for "NON_DDF_DATA_SET" rule', done => {
      ddfDataSet.load(() => {
        const result = generalRules[rulesRegistry.NON_DDF_DATA_SET](ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });

    it('there should be no issues for "NON_DDF_FOLDER" rule', done => {
      ddfDataSet.load(() => {
        const result = generalRules[rulesRegistry.NON_DDF_FOLDER](ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });

    it('there should be no issues for "INCORRECT_JSON_FIELD" rule', done => {
      ddfDataSet.load(() => {
        const result = generalRules[rulesRegistry.INCORRECT_JSON_FIELD](ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });

    it('there should be no issues for "INCORRECT_IDENTIFIER" rule', done => {
      ddfDataSet.load(() => {
        const result = generalRules[rulesRegistry.INCORRECT_IDENTIFIER](ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });
  });

  describe('when DDF folder is NOT correct (fixtures/bad-folder)', () => {
    const folder = './test/fixtures/bad-folder';
    const ddfDataSet = new DdfDataSet(folder);
    const expectedRules = [rulesRegistry.NON_DDF_DATA_SET, rulesRegistry.NON_DDF_FOLDER];

    expectedRules.forEach(generalRuleKey => {
      it(`one issue should be detected for "${Symbol.keyFor(generalRuleKey)}" rule`, done => {
        ddfDataSet.load(() => {
          const result = generalRules[generalRuleKey](ddfDataSet);

          expect(result.length).to.equal(1);

          done();
        });
      });

      it(`type of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be expected`, done => {
        ddfDataSet.load(() => {
          const result = generalRules[generalRuleKey](ddfDataSet);
          const issue = _.head(result);

          expect(issue.type).to.equal(generalRuleKey);

          done();
        });
      });

      it(`path of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be "${folder}"`, done => {
        ddfDataSet.load(() => {
          const result = generalRules[generalRuleKey](ddfDataSet);
          const issue = _.head(result);

          expect(issue.path).to.equal(folder);

          done();
        });
      });
    });
  });

  describe(`when concepts in DDF folder contain wrong JSON fields
   (fixtures/rules-cases/incorrect-json-field)`, () => {
    const folder = './test/fixtures/rules-cases/incorrect-json-field';
    const ddfDataSet = new DdfDataSet(folder);

    it('4 issues should be found', done => {
      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_QUANTITY = 4;
        const result = generalRules[rulesRegistry.INCORRECT_JSON_FIELD](ddfDataSet);

        expect(result.length).to.equal(EXPECTED_ISSUES_QUANTITY);

        done();
      });
    });

    it('all of issues should be a valid type', done => {
      ddfDataSet.load(() => {
        const result = generalRules[rulesRegistry.INCORRECT_JSON_FIELD](ddfDataSet);

        result.forEach(issue => {
          expect(issue.type).to.equal(rulesRegistry.INCORRECT_JSON_FIELD);
        });

        done();
      });
    });


    it('suggestion for 3 first issues should be expected', done => {
      ddfDataSet.load(() => {
        const LAST_WARNING_INDEX = 2;
        const expectedSuggestions = [
          '{"selectable":false,"palette":{"sub_saharan_africa":"#4e7af0","east_asia_pacific":"#f03838",' +
          '"america":"#ebcc21","south_asia":"#35d1d1","middle_east_north_africa":"#5be56b",' +
          '"europe_central_asia":"#f49d37"}}',
          '["ordinal"]',
          '{"palette":{"0":"#62CCE3","1":"#B4DE79","2":"#E1CE00","3":"#F77481"}}'
        ];
        const result = generalRules[rulesRegistry.INCORRECT_JSON_FIELD](ddfDataSet);

        for (let count = 0; count <= LAST_WARNING_INDEX; count++) {
          const suggestion = _.head(result[count].suggestions);

          expect(suggestion).to.equal(expectedSuggestions[count]);
        }

        done();
      });
    });
  });

  describe(`when some concepts and entity values have incorrect identifiers
   (fixtures/rules-cases/incorrect-identifier)`, () => {
    const folder = './test/fixtures/rules-cases/incorrect-identifier';
    const ddfDataSet = new DdfDataSet(folder);

    it('2 issues should be found and they should be expected', done => {
      const EXPECTED_ISSUES_QUANTITY = 2;
      const issuesData = [
        {
          file: 'ddf--entities--geo--country.csv',
          data: [{conceptName: 'geo', conceptValue: 'a#f$g', line: 2}]
        },
        {
          file: 'ddf--concepts.csv',
          data: [{conceptValue: 'do-main', line: 4}]
        }
      ];

      ddfDataSet.load(() => {
        const results = generalRules[rulesRegistry.INCORRECT_IDENTIFIER](ddfDataSet);

        expect(results.length).to.equal(EXPECTED_ISSUES_QUANTITY);

        issuesData.forEach((issueData, index) => {
          expect(results[index].type).to.equal(rulesRegistry.INCORRECT_IDENTIFIER);
          expect(_.endsWith(results[index].path, issueData.file)).to.be.true;
          expect(_.isEqual(results[index].data, issueData.data)).to.be.true;
        });

        done();
      });
    });
  });

  describe('when "WRONG_DATA_POINT_HEADER" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder');

      ddfDataSet.load(() => {
        expect(generalRules[rulesRegistry.WRONG_DATA_POINT_HEADER](ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/wrong-data-point-header)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/wrong-data-point-header');

      ddfDataSet.load(() => {
        const results = generalRules[rulesRegistry.WRONG_DATA_POINT_HEADER](ddfDataSet);
        const result = _.head(results);
        const EXPECTED_ISSUES_QUANTITY = 1;
        const EXPECTED_WRONG_CONCEPT = 'name';

        expect(results.length).to.equal(EXPECTED_ISSUES_QUANTITY);
        expect(!!result.data).to.be.true;
        expect(_.isEmpty(result.data.wrongConcepts)).to.be.false;
        expect(_.head(result.data.wrongConcepts)).to.equal(EXPECTED_WRONG_CONCEPT);

        done();
      });
    });
  });
});
