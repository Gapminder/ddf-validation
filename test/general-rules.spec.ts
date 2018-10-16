import * as chai from 'chai';
import { head, endsWith, isEqual } from 'lodash';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';
import {
  NON_DDF_DATA_SET,
  INCORRECT_JSON_FIELD,
  INCORRECT_IDENTIFIER,
  WRONG_DATA_POINT_HEADER, DUPLICATED_SYNONYM_KEY
} from '../src/ddf-rules/registry';
import { Issue } from '../src/ddf-rules/issue';
import { allRules } from '../src/ddf-rules';

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('general rules', () => {
  describe('when DDF folder is correct', () => {
    it('there should be no issues for "NON_DDF_DATA_SET" rule', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-dp', null);

      ddfDataSet.load(() => {
        const result = allRules[NON_DDF_DATA_SET].rule(ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });

    it('there should be no issues for "INCORRECT_JSON_FIELD" rule', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-dp', null);

      ddfDataSet.load(() => {
        const result = allRules[INCORRECT_JSON_FIELD].rule(ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });

    it('there should be no issues for "INCORRECT_IDENTIFIER" rule', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-dp', null);

      ddfDataSet.load(() => {
        const result = allRules[INCORRECT_IDENTIFIER].rule(ddfDataSet);

        expect(result.length).to.equal(0);

        done();
      });
    });
  });

  describe('when DDF folder is NOT correct (fixtures/bad-folder)', () => {
    const folder = './test/fixtures/bad-folder';
    const expectedRules = [NON_DDF_DATA_SET];

    expectedRules.forEach(generalRuleKey => {
      it(`one issue should be detected for "${Symbol.keyFor(generalRuleKey)}" rule`, done => {
        const ddfDataSet = new DdfDataSet(folder, null);

        ddfDataSet.load(() => {
          const result = allRules[generalRuleKey].rule(ddfDataSet);

          expect(result.length).to.equal(1);

          done();
        });
      });

      it(`type of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be expected`, done => {
        const ddfDataSet = new DdfDataSet(folder, null);

        ddfDataSet.load(() => {
          const results: Array<Issue> = allRules[generalRuleKey].rule(ddfDataSet);
          const issue = head(results);

          expect(issue.type).to.equal(generalRuleKey);

          done();
        });
      });

      it(`path of issue for "${Symbol.keyFor(generalRuleKey)}" rule should be "${folder}"`, done => {
        const ddfDataSet = new DdfDataSet(folder, null);

        ddfDataSet.load(() => {
          const results: Array<Issue> = allRules[generalRuleKey].rule(ddfDataSet);
          const issue = head(results);

          expect(issue.path).to.equal(folder);

          done();
        });
      });
    });
  });

  describe(`when concepts in DDF folder contain wrong JSON fields
   (fixtures/rules-cases/incorrect-json-field)`, () => {
    const folder = './test/fixtures/rules-cases/incorrect-json-field';

    it('2 issues should be found', done => {
      const ddfDataSet = new DdfDataSet(folder, null);

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_QUANTITY = 2;
        const results: Array<Issue> = allRules[INCORRECT_JSON_FIELD].rule(ddfDataSet);

        expect(results.length).to.equal(EXPECTED_ISSUES_QUANTITY);

        done();
      });
    });

    it('all of issues should be a valid type', done => {
      const ddfDataSet = new DdfDataSet(folder, null);

      ddfDataSet.load(() => {
        const result = allRules[INCORRECT_JSON_FIELD].rule(ddfDataSet);

        result.forEach(issue => {
          expect(issue.type).to.equal(INCORRECT_JSON_FIELD);
        });

        done();
      });
    });


    it('suggestions for issues should be expected', done => {
      const ddfDataSet = new DdfDataSet(folder, null);

      ddfDataSet.load(() => {
        const expectedSuggestions = [
          '{"selectable":false,"palette":{"sub_saharan_africa":"#4e7af0",' +
          '"east_asia_pacific":"#f03838","america":"#ebcc21","south_asia":"#35d1d1",' +
          '"middle_east_north_africa":"#5be56b","europe_central_asia":"#f49d37"}}',
          '{"palette":{"0":"#62CCE3","1":"#B4DE79","2":"#E1CE00","3":"#F77481"}}'
        ];
        const results = allRules[INCORRECT_JSON_FIELD].rule(ddfDataSet);

        results.forEach((result, index) => {
          expect(head(result.suggestions)).to.equal(expectedSuggestions[index]);
        });

        done();
      });
    });
  });

  describe(`when some concepts and entity values have incorrect identifiers
   (fixtures/rules-cases/incorrect-identifier)`, () => {
    const folder = './test/fixtures/rules-cases/incorrect-identifier';

    it('2 issues should be found and they should be expected', done => {
      const ddfDataSet = new DdfDataSet(folder, null);
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
        try {
          const results = allRules[INCORRECT_IDENTIFIER].rule(ddfDataSet);

          expect(results.length).to.equal(EXPECTED_ISSUES_QUANTITY);

          issuesData.forEach((issueData, index) => {
            expect(results[index].type).to.equal(INCORRECT_IDENTIFIER);
            expect(endsWith(results[index].path, issueData.file)).to.be.true;
            expect(isEqual(results[index].data, issueData.data)).to.be.true;
          });

          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('when "WRONG_DATA_POINT_HEADER" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-dp', null);

      ddfDataSet.load(() => {
        const results: Issue[] = allRules[WRONG_DATA_POINT_HEADER].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it('any issue should NOT be found for folder with quoted header (fixtures/good-folder)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/quoted-header', null);

      ddfDataSet.load(() => {
        const results: Issue[] = allRules[WRONG_DATA_POINT_HEADER].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
   (fixtures/rules-cases/wrong-data-point-header)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/wrong-data-point-header', null);

      ddfDataSet.load(() => {
        const results: Issue[] = allRules[WRONG_DATA_POINT_HEADER].rule(ddfDataSet);
        const EXPECTED_RESULTS = [
          {
            path: 'ddf--datapoints--pop--by--country--year.csv',
            data: {
              primaryKeyInvalidParts: [
                'name'
              ],
              reason: 'some parts of the primary key have an incorrect type'
            }
          },
          {
            path: 'ddf--datapoints--pop--by--country--year.csv',
            data: {
              sharedHeaders: [
                'country'
              ],
              primaryKey: [
                'country',
                'name'
              ],
              reason: 'primary from datapackage does not correspond with header from ddf file'
            }
          }
        ];

        expect(results.length).to.equal(EXPECTED_RESULTS.length);

        results.forEach((result: Issue, index: number) => {
          expect(endsWith(result.path, EXPECTED_RESULTS[index].path)).to.be.true;
          expect(!!result.data).to.be.true;
          expect(isEqual(result.data, EXPECTED_RESULTS[index].data)).to.be.true;
        });

        done();
      });
    });
  });

  describe('when "DUPLICATED_SYNONYM_KEY" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/ddf--gapminder--geo_entity_domain)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/ddf--gapminder--geo_entity_domain', null);

      ddfDataSet.load(() => {
        const results: Issue[] = allRules[DUPLICATED_SYNONYM_KEY].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`an issue should be raised for folder with the problem
   (fixtures/rules-cases/duplicated-synonym-key)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/duplicated-synonym-key', null);

      ddfDataSet.load(() => {
        const results: Issue[] = allRules[DUPLICATED_SYNONYM_KEY].rule(ddfDataSet);
        const result = head(results);
        const expectedKey = ['afg', 'Afghanistan'];

        expect(results.length).to.equal(1);
        expect(endsWith(result.path, 'ddf--synonyms--country.csv')).to.be.true;
        expect(result.data).to.deep.equal(expectedKey);

        done();
      });
    });
  });
});
