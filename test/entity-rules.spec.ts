import * as chai from 'chai';
import { sortBy, head } from 'lodash';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';
import {
  WRONG_ENTITY_IS_HEADER,
  WRONG_ENTITY_IS_VALUE,
  NON_UNIQUE_ENTITY_VALUE,
  UNEXISTING_CONSTRAINT_VALUE
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

    it(`issues should be found for folder with the problem
   (fixtures/rules-cases/non-unique-entity-value)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-unique-entity-value', null);
      ddfDataSet.load(() => {
        const results: Array<Issue> = allRules[NON_UNIQUE_ENTITY_VALUE].rule(ddfDataSet);
        const issuesData = [
          {
            source: {
              geo: 'afg',
              name: 'Afghanistan'
            },
            duplicate: {
              geo: 'afg',
              name: 'Afghanistan2'
            }
          },
          {
            source: {
              geo: 'vat',
              name: 'Vatican2'
            },
            duplicate: {
              geo: 'vat',
              name: 'Vatican'
            }
          }
        ];
        const resultsCopy = sortBy(results, result => result.data.source.geo);

        expect(resultsCopy.length).to.equal(issuesData.length);

        issuesData.forEach((issueData, index) => {
          expect(resultsCopy[index].type).to.equal(NON_UNIQUE_ENTITY_VALUE);
          expect(!!resultsCopy[index].data).to.be.true;
          expect(!!resultsCopy[index].data.source).to.be.true;
          expect(!!resultsCopy[index].data.duplicate).to.be.true;
          expect(resultsCopy[index].data.source.geo).to.equal(issueData.source.geo);
          expect(resultsCopy[index].data.duplicate.geo).to.equal(issueData.duplicate.geo);
        });

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
});
