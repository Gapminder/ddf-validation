import * as chai from 'chai';
import { sortBy, head, endsWith } from 'lodash';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';
import {
  WRONG_ENTITY_IS_HEADER,
  WRONG_ENTITY_IS_VALUE,
  NON_UNIQUE_ENTITY_VALUE,
  UNEXISTING_CONSTRAINT_VALUE,
  INCORRECT_BOOLEAN_ENTITY,
  CONCEPT_LOOKS_LIKE_BOOLEAN,
  ENTITY_VALUE_AS_ENTITY_NAME
} from '../src/ddf-rules/registry';
import { Issue } from '../src/ddf-rules/issue';
import { allRules } from '../src/ddf-rules';

const expect = chai.expect;

process.env.SILENT_MODE = true;

describe('rules for entry', () => {
  let ddfDataSet = null;

  describe('when "WRONG_ENTITY_IS_HEADER" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[WRONG_ENTITY_IS_HEADER].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with next problems: 'Not a concept' and 'Wrong concept type'
     (fixtures/rules-cases/wrong-entity-is-header)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/wrong-entity-is-header', null);
      ddfDataSet.load(() => {
        const result = allRules[WRONG_ENTITY_IS_HEADER].rule(ddfDataSet);

        const issuesData = [
          {
            message: 'Not a concept',
            headerDetail: 'is--bar'
          },
          {
            message: 'Wrong concept type',
            headerDetail: 'is--geo'
          }
        ];

        issuesData.forEach((issueData, index) => {
          expect(result[index].type).to.equal(WRONG_ENTITY_IS_HEADER);
          expect(!!result[index].data).to.be.true;
          expect(result[index].data.message).to.equal(issueData.message);
          expect(result[index].data.headerDetail).to.equal(issueData.headerDetail);
        });

        done();
      });
    });

    it(`issues should be found for folder with next problem: 'Forbidden domain for the entity set'
    (fixtures/rules-cases/wrong-entity-is-header-2)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/wrong-entity-is-header-2', null);
      ddfDataSet.load(() => {
        const results = allRules[WRONG_ENTITY_IS_HEADER].rule(ddfDataSet);
        const data = {
          message: 'Forbidden domain for the entity set',
          currentEntitySet: 'zzz',
          currentDomain: 'xyz',
          primaryKeyDomain: 'geo'
        };
        const result: Issue = <Issue>head(results);

        expect(results.length).to.equal(1);
        expect(result.type).to.equal(WRONG_ENTITY_IS_HEADER);
        expect(!!result.data).to.be.true;
        expect(result.data.message).to.equal(data.message);
        expect(result.data.currentEntitySet).to.equal(data.currentEntitySet);
        expect(result.data.currentDomain).to.equal(data.currentDomain);
        expect(result.data.primaryKeyDomain).to.equal(data.primaryKeyDomain);

        done();
      });
    });
  });

  describe('when "WRONG_ENTITY_IS_VALUE" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[WRONG_ENTITY_IS_VALUE].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
   (fixtures/rules-cases/wrong-entity-is-value)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/wrong-entity-is-value', null);
      ddfDataSet.load(() => {
        const result = allRules[WRONG_ENTITY_IS_VALUE].rule(ddfDataSet);
        const issuesData = [
          {
            header: 'is--region',
            value: '0'
          }, {
            header: 'is--country',
            value: 'foo'
          }, {
            header: 'is--region',
            value: '0'
          }, {
            header: 'is--country',
            value: 'True'
          }, {
            header: 'is--capital',
            value: 'fAlse'
          }
        ];

        expect(result.length).to.equal(issuesData.length);

        issuesData.forEach((issueData, index) => {
          expect(result[index].type).to.equal(WRONG_ENTITY_IS_VALUE);
          expect(!!result[index].data).to.be.true;
          expect(result[index].data.header).to.equal(issueData.header);
          expect(result[index].data.value).to.equal(issueData.value);
        });

        done();
      });
    });
  });

  describe('when "NON_UNIQUE_ENTITY_VALUE" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[NON_UNIQUE_ENTITY_VALUE].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it('any issue should NOT be found for folder with an entity that has time type (fixtures/rules-cases/non-unique-entity-value-time)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[NON_UNIQUE_ENTITY_VALUE].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with a problem (fixtures/rules-cases/non-unique-entity-value)`, done => {
      const EXPECTED_ISSUES_DATA = [
        {
          data: {
            value: 'afg',
            records: [
              {
                geo: 'afg',
                $$source: 'ddf--entities--geo--country.csv',
                $$lineNumber: 2
              },
              {
                geo: 'afg',
                $$source: 'ddf--entities--geo--country.csv',
                $$lineNumber: 3
              }
            ]
          }
        },
        {
          data: {
            value: 'and',
            records: [
              {
                geo: 'and',
                $$source: 'ddf--entities--geo--country.csv',
                $$lineNumber: 1
              },
              {
                geo: 'and',
                $$source: 'ddf--entities--geo--capital.csv',
                $$lineNumber: 2
              }
            ]
          }
        },
        {
          data: {
            value: 'vat',
            records: [
              {
                geo: 'vat',
                $$source: 'ddf--entities--geo--capital.csv',
                $$lineNumber: 1
              },
              {
                geo: 'vat',
                $$source: 'ddf--entities--geo--country.csv',
                $$lineNumber: 9
              }
            ]
          }
        }
      ];

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-entity-value', null);
      ddfDataSet.load(() => {
        const issuesSource: Issue[] = allRules[NON_UNIQUE_ENTITY_VALUE].rule(ddfDataSet);
        const issuesData = sortBy(issuesSource, result => result.data.value);

        issuesData.forEach((issueData, issueIndex) => {
          const records = sortBy(issueData.data.records, (result: any) => result.$$lineNumber);

          records.forEach((record, recordIndex) => {
            expect(issuesData.length).to.equal(EXPECTED_ISSUES_DATA.length);

            expect(!!issueData.data).to.be.true;
            expect(issueData.data.value).to.equal(EXPECTED_ISSUES_DATA[issueIndex].data.value);
            expect(!!issueData.data.records).to.be.true;
            expect(issueData.data.records.length).to.equal(EXPECTED_ISSUES_DATA[issueIndex].data.records.length);

            expect(record.geo).to.equal(EXPECTED_ISSUES_DATA[issueIndex].data.records[recordIndex].geo);
            expect(record.$$lineNumber).to.equal(EXPECTED_ISSUES_DATA[issueIndex].data.records[recordIndex].$$lineNumber);
            expect(endsWith(record.$$source, EXPECTED_ISSUES_DATA[issueIndex].data.records[recordIndex].$$source)).to.be.true;
          });
        });

        done();
      });
    });

    it(`issues should be found for folder with an another problem (fixtures/rules-cases/non-unique-entity-value-2)`, done => {
      const EXPECTED_ISSUE_DATA = {
        data: {
          value: 'luxemburg',
          records: [
            {
              geo: 'luxemburg',
              $$source: 'ddf--entities--geo--city.csv',
              $$lineNumber: 1
            },
            {
              geo: 'luxemburg',
              $$source: 'ddf--entities--geo--country.csv',
              $$lineNumber: 2
            },
            {
              geo: 'luxemburg',
              $$source: 'ddf--entities--geo.csv',
              $$lineNumber: 1
            }
          ]
        }
      };

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-entity-value-2', null);
      ddfDataSet.load(() => {
        const issuesData: Issue[] = allRules[NON_UNIQUE_ENTITY_VALUE].rule(ddfDataSet);
        const issue = head(issuesData);
        const records = sortBy(issue.data.records, (result: any) => result.$$source);

        records.forEach((record, recordIndex) => {
          expect(issuesData.length).to.equal(1);
          expect(record.geo).to.equal(EXPECTED_ISSUE_DATA.data.records[recordIndex].geo);
          expect(record.$$lineNumber).to.equal(EXPECTED_ISSUE_DATA.data.records[recordIndex].$$lineNumber);
          expect(endsWith(record.$$source, EXPECTED_ISSUE_DATA.data.records[recordIndex].$$source)).to.be.true;
        });

        done();
      });
    });

    it(`issues should be found for folder with an another problem (fixtures/rules-cases/non-unique-entity-value-3)`, done => {
      const EXPECTED_ISSUE_DATA = {
        data: {
          value: 'luxemburg',
          records: [
            {
              geo: 'luxemburg',
              $$source: 'ddf--entities--geo--city.csv',
              $$lineNumber: 1
            },
            {
              geo: 'luxemburg',
              $$source: 'ddf--entities--geo--country.csv',
              $$lineNumber: 2
            }
          ]
        }
      };

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-entity-value-3', null);
      ddfDataSet.load(() => {
        const issuesData: Issue[] = allRules[NON_UNIQUE_ENTITY_VALUE].rule(ddfDataSet);
        const issue = head(issuesData);
        const records = sortBy(issue.data.records, (result: any) => result.$$source);

        records.forEach((record, recordIndex) => {
          expect(issuesData.length).to.equal(1);
          expect(record.geo).to.equal(EXPECTED_ISSUE_DATA.data.records[recordIndex].geo);
          expect(record.$$lineNumber).to.equal(EXPECTED_ISSUE_DATA.data.records[recordIndex].$$lineNumber);
          expect(endsWith(record.$$source, EXPECTED_ISSUE_DATA.data.records[recordIndex].$$source)).to.be.true;
        });

        done();
      });
    });

    it(`issues should NOT be found for same entity values from different domains (fixtures/rules-cases/unique-entity-value`, done => {

      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unique-entity-value', null);
      ddfDataSet.load(() => {
        const issuesData: Issue[] = allRules[NON_UNIQUE_ENTITY_VALUE].rule(ddfDataSet);

        expect(issuesData.length).to.equal(0);

        done();
      });
    });
  });

  describe('when "UNEXISTING_CONSTRAINT_VALUE" rule', () => {
    it('any issue should NOT be found for a folder without the problem (fixtures/good-folder-unpop-wpp_population)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-unpop-wpp_population', null);
      ddfDataSet.load(() => {
        expect(allRules[UNEXISTING_CONSTRAINT_VALUE].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it('any issue should NOT be found for a folder without the problem (fixtures/rules-cases/unexisting-constraint-value-2)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexisting-constraint-value-2', null);
      ddfDataSet.load(() => {
        expect(allRules[UNEXISTING_CONSTRAINT_VALUE].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
   (fixtures/rules-cases/unexisting-constraint-value)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexisting-constraint-value', null);
      ddfDataSet.load(() => {
        const result = allRules[UNEXISTING_CONSTRAINT_VALUE].rule(ddfDataSet);
        const issuesData = [
          {constraintEntityValue: '777'}
        ];

        expect(result.length).to.equal(1);

        issuesData.forEach((issueData, index) => {
          expect(result[index].type).to.equal(UNEXISTING_CONSTRAINT_VALUE);
          expect(!!result[index].data).to.be.true;
          expect(result[index].data.constraintEntityValue).to.equal(issueData.constraintEntityValue);
        });

        done();
      });
    });
  });

  describe('when "INCORRECT_BOOLEAN_ENTITY" rule', () => {
    it('any issue should NOT be found for a folder without the problem (SG)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/ddf--sg', null);
      ddfDataSet.load(() => {
        expect(allRules[INCORRECT_BOOLEAN_ENTITY].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it('a couple of issues should be found for a folder with the problem', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/incorrect-boolean-entity', null);
      ddfDataSet.load(() => {
        const expectedData: any[] = [
          {
            path: 'ddf--entities--geo--country.csv',
            data: {
              fieldsWithWrongValues: [
                'un_state'
              ],
              line: 1
            }
          },
          {
            path: 'ddf--entities--geo--country.csv',
            data: {
              fieldsWithWrongValues: [
                'un_state'
              ],
              line: 27
            }
          }
        ];
        const issues = allRules[INCORRECT_BOOLEAN_ENTITY].rule(ddfDataSet);

        issues.forEach((issue, index) => {
          expect(issues.length).to.equal(expectedData.length);
          expect(endsWith(issue.path, expectedData[index].path)).to.be.true;
          expect(issue.data.fieldsWithWrongValues).to.deep.equal(expectedData[index].data.fieldsWithWrongValues);
          expect(issue.data.line).to.equal(expectedData[index].data.line);
        });

        done();
      });
    });
  });

  describe('when "CONCEPT_LOOKS_LIKE_BOOLEAN" rule', () => {
    it('any issue should NOT be found for a folder without the problem (SG)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/ddf--sg', null);
      ddfDataSet.load(() => {
        expect(allRules[CONCEPT_LOOKS_LIKE_BOOLEAN].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it('an issue should be found for a folder with the problem', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/concept-looks-like-boolean', null);
      ddfDataSet.load(() => {
        const issues = <Issue[]>allRules[CONCEPT_LOOKS_LIKE_BOOLEAN].rule(ddfDataSet);
        const issue: Issue = head(issues);

        expect(issues.length).to.equal(1);
        expect(issue.data.concept).to.equal('arb5');

        done();
      });
    });
  });

  describe('when "ENTITY_VALUE_AS_ENTITY_NAME" rule', () => {
    it('any issue should NOT be found for a folder without the problem (SG)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-dp', null);
      ddfDataSet.load(() => {
        expect(allRules[ENTITY_VALUE_AS_ENTITY_NAME].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it('an issue should be found for a folder with the problem', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/entity-value-as-entity-name', null);
      ddfDataSet.load(() => {
        const issues = <Issue[]>allRules[ENTITY_VALUE_AS_ENTITY_NAME].rule(ddfDataSet);
        const issue: Issue = head(issues);

        expect(issues.length).to.equal(1);
        expect(endsWith(issue.path, 'ddf--entities--geo.csv')).to.be.true;
        expect(issue.data.entityName).to.equal('geo');
        expect(issue.data.entityRecord.geo).to.equal('geo');
        expect(issue.data.entityRecord.geo_name).to.equal('Georgia');
        expect(issue.data.entityRecord.$$source).to.equal(issue.path);
        expect(issue.data.entityRecord.$$lineNumber).to.equal(4);

        done();
      });
    });
  });
});
