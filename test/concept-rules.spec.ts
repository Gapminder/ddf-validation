import * as chai from 'chai';

import {head, isEmpty, isEqual} from 'lodash';
import {DdfDataSet} from '../src/ddf-definitions/ddf-data-set';
import {
  CONCEPT_ID_IS_NOT_UNIQUE,
  EMPTY_CONCEPT_ID,
  NON_CONCEPT_HEADER,
  CONCEPT_MANDATORY_FIELD_NOT_FOUND,
  CONCEPTS_NOT_FOUND,
  INVALID_DRILL_UP
} from '../src/ddf-rules/registry';
import {Issue} from '../src/ddf-rules/issue';
import {allRules} from '../src/ddf-rules';

const expect = chai.expect;

describe('rules for concept', () => {
  let ddfDataSet = null;

  describe('when "CONCEPT_ID_IS_NOT_UNIQUE" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[CONCEPT_ID_IS_NOT_UNIQUE].rule(ddfDataSet)).to.be.null;

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/concept-is-not-unique)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/concept-is-not-unique', null);
      ddfDataSet.load(() => {
        const result = allRules[CONCEPT_ID_IS_NOT_UNIQUE].rule(ddfDataSet);

        expect(result).to.be.not.null;
        expect(result.type).to.equal(CONCEPT_ID_IS_NOT_UNIQUE);
        expect(result.data.indexOf('geo')).to.be.greaterThan(-1);
        expect(result.data.indexOf('country')).to.be.greaterThan(-1);

        done();
      });
    });
  });

  describe('when "EMPTY_CONCEPT_ID" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[EMPTY_CONCEPT_ID].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/empty-concept-id)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/empty-concept-id', null);
      ddfDataSet.load(() => {
        const EXPECTED_CSV_LINE = 2;
        const results: Array<Issue> = allRules[EMPTY_CONCEPT_ID].rule(ddfDataSet);
        const result = head(results);

        expect(results).to.be.not.null;
        expect(results.length).to.equal(1);
        expect(result.type).to.equal(EMPTY_CONCEPT_ID);
        expect(result.data.line).to.equal(EXPECTED_CSV_LINE);

        done();
      });
    });
  });

  describe('when "NON_CONCEPT_HEADER" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[NON_CONCEPT_HEADER].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/non-concept-header)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/non-concept-header', null);
      ddfDataSet.load(() => {
        const result = allRules[NON_CONCEPT_HEADER].rule(ddfDataSet);
        const issuesData = [
          {
            wrongHeaderDetails: 'wrong-header-1',
            suggestions: []
          },
          {
            wrongHeaderDetails: 'xgeo',
            suggestions: ['geo']
          },
          {
            wrongHeaderDetails: 'domain',
            suggestions: []
          }
        ];

        expect(result).to.be.not.null;

        issuesData.forEach((issueData, index) => {
          expect(result[index].type).to.equal(NON_CONCEPT_HEADER);
          expect(!!result[index].data).to.be.true;
          expect(result[index].data).to.equal(issueData.wrongHeaderDetails);
          expect(head(result[index].suggestions)).to.equal(head(issueData.suggestions));
        });

        done();
      });
    });
  });

  describe('when "CONCEPT_MANDATORY_FIELD_NOT_FOUND" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        expect(allRules[CONCEPT_MANDATORY_FIELD_NOT_FOUND].rule(ddfDataSet).length).to.equal(0);

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/concept-mandatory-field-not-found)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/concept-mandatory-field-not-found', null);
      ddfDataSet.load(() => {
        const result = allRules[CONCEPT_MANDATORY_FIELD_NOT_FOUND].rule(ddfDataSet);
        const issuesData = [
          {
            line: 1,
            field: 'concept_type',
            value: true

          },
          {
            line: 3,
            field: 'domain',
            value: true
          },
          {
            line: 4,
            field: 'domain',
            value: false
          }
        ];

        expect(result).to.be.not.null;
        expect(result.length).to.equal(issuesData.length);

        issuesData.forEach((issueData, index) => {
          expect(result[index].type).to.equal(CONCEPT_MANDATORY_FIELD_NOT_FOUND);
          expect(!!result[index].data).to.be.true;
          expect(result[index].data.line).to.equal(issueData.line);
          expect(result[index].data.field).to.equal(issueData.field);
          expect(!!result[index].data.value).to.equal(issueData.value);
        });

        done();
      });
    });
  });

  describe('when "CONCEPTS_NOT_FOUND" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        const result = allRules[CONCEPTS_NOT_FOUND].rule(ddfDataSet);

        expect(result).to.be.null;

        done();
      });
    });

    it(`issues should be found for folder with the problem
    (fixtures/rules-cases/concepts-not-found)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/concepts-not-found', null);
      ddfDataSet.load(() => {
        const result = allRules[CONCEPTS_NOT_FOUND].rule(ddfDataSet);

        expect(result).to.be.not.null;
        expect(result.type).to.equal(CONCEPTS_NOT_FOUND);

        done();
      });
    });
  });

  describe('when "INVALID_DRILL_UP" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/good-folder)', done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/good-folder', null);
      ddfDataSet.load(() => {
        const results = allRules[INVALID_DRILL_UP].rule(ddfDataSet);

        expect(isEmpty(results)).to.be.true;

        done();
      });
    });

    it(`issues should be found for folder with the problem
     (fixtures/rules-cases/invalid-drill-up)`, done => {
      ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/invalid-drill-up', null);
      ddfDataSet.load(() => {
        const results: Array<Issue> = allRules[INVALID_DRILL_UP].rule(ddfDataSet);
        const expectedReasons = [
          {
            conceptDomain: 'geo2',
            expectedDomain: 'geo',
            reason: 'Domain in a Drillup is not a domain of a concept having this Drillup belongs to'
          },
          {
            drillUpName: 'foo',
            reason: 'Concept for Drillup is not found'
          },
          {
            conceptDomain: 'geo2',
            expectedDomain: 'geo',
            reason: 'Entity domain in Drillup should be same as Entity domain for current Concept'
          }
        ];

        expect(isEmpty(results)).to.be.false;
        expect(results.length).to.equal(1);

        const result = head(results);

        expect(result.type).to.equal(INVALID_DRILL_UP);
        expect(isEqual(result.data.reasons, expectedReasons)).to.be.true;

        done();
      });
    });
  });
});
