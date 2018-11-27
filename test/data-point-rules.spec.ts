import * as chai from 'chai';
import { EventEmitter } from 'events';
import { head, isEqual } from 'lodash';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';
import {
  DATA_POINT_UNEXPECTED_ENTITY_VALUE,
  DATA_POINT_UNEXPECTED_TIME_VALUE,
  DATA_POINT_CONSTRAINT_VIOLATION,
  DUPLICATED_DATA_POINT_KEY
} from '../src/ddf-rules/registry';
import { allRules } from '../src/ddf-rules';
import { Issue } from '../src/ddf-rules/issue';
import { getAllDataPointFileDescriptorsChunks } from '../src/shared';
import { DataPointChunksProcessingStory } from '../src/stories/data-point-chunks-processing';
import { IssuesFilter } from '../src/utils/issues-filter';

const expect = chai.expect;

process.env.SILENT_MODE = true;

const issuesFilter = new IssuesFilter({});

describe('rules for data points', () => {
  describe(`when data set is correct ('fixtures/good-folder-dp')`, () => {
    Object.getOwnPropertySymbols(allRules).forEach(dataPointRuleKey => {
      it(`any issue should NOT be found for rule ${Symbol.keyFor(dataPointRuleKey)}`, done => {
        const ddfDataSet = new DdfDataSet('./test/fixtures/good-folder-dp', null);
        const issueEmitter = new EventEmitter();
        const issues: Issue[] = [];

        ddfDataSet.load(() => {
          const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
          const finalizer = allRules[dataPointRuleKey].resetStorage;
          const theEnd = () => {
            expect(issues.length).to.equal(0);

            if (finalizer) {
              finalizer();
            }

            done();
          };

          issueEmitter.on('issue', (issue) => {
            issues.push(issue);
          });

          const customRules = [{
            ruleKey: dataPointRuleKey,
            rule: allRules[dataPointRuleKey]
          }];

          const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

          dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
        });
      });
    });
  });

  describe('when data set is NOT correct', () => {
    it(`an issue should be found for rule 'DATA_POINT_UNEXPECTED_ENTITY_VALUE'
   (fixtures/rules-cases/data-point-unexpected-entity-value)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-entity-value', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];
      const expectedData = [
        {
          id: 'DATA_POINT_UNEXPECTED_ENTITY_VALUE',
          path: 'ddf--datapoints--pop--by--country--year.csv',
          data: {concept: 'country', line: 2, value: 'non-usa'}
        },
        {
          path: 'ddf--datapoints--pop--by--country--year.csv',
          data: {concept: 'country', line: 4, value: ''}
        }
      ];

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(expectedData.length);

          issues.forEach((issue: Issue, i: number) => {
            expect(issue.path.endsWith(expectedData[i].path)).to.be.true;
            expect(issue.data).to.deep.equal(expectedData[i].data);
          });

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });

        const customRules = [{
          ruleKey: DATA_POINT_UNEXPECTED_ENTITY_VALUE,
          rule: allRules[DATA_POINT_UNEXPECTED_ENTITY_VALUE]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_UNEXPECTED_TIME_VALUE'
   (fixtures/rules-cases/data-point-unexpected-time-value)`, done => {
      const EXPECTED_FILE = 'ddf--datapoints--pop--by--country--year.csv';
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-time-value', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];
      const expectedConcept = 'year';
      const expectedLine = 2;
      const expectedValue = '1960wfoo';

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(1);

          const issue = head(issues);

          expect(issue.path.endsWith(EXPECTED_FILE)).to.be.true;
          expect(!!issue.data).to.be.true;
          expect(issue.data.concept).to.equal(expectedConcept);
          expect(issue.data.line).to.equal(expectedLine);
          expect(issue.data.value).to.equal(expectedValue);

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });

        const customRules = [{
          ruleKey: DATA_POINT_UNEXPECTED_TIME_VALUE,
          rule: allRules[DATA_POINT_UNEXPECTED_TIME_VALUE]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_UNEXPECTED_ENTITY_VALUE'
   (fixtures/rules-cases/data-point-unexpected-entity-value-2)`, done => {
      const EXPECTED_FILE = 'ddf--datapoints--pop--by--geo--year.csv';
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-unexpected-entity-value-2', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];
      const expectedConcept = 'geo';
      const expectedLine = 2;
      const expectedValue = 'Afg';

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(1);

          const issue = head(issues);

          expect(issue.path.endsWith(EXPECTED_FILE)).to.be.true;
          expect(!!issue.data).to.be.true;
          expect(issue.data.concept).to.equal(expectedConcept);
          expect(issue.data.line).to.equal(expectedLine);
          expect(issue.data.value).to.equal(expectedValue);

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });

        const customRules = [{
          ruleKey: DATA_POINT_UNEXPECTED_ENTITY_VALUE,
          rule: allRules[DATA_POINT_UNEXPECTED_ENTITY_VALUE]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });

    it(`an issue should be found for rule 'DATA_POINT_CONSTRAINT_VIOLATION'
   (fixtures/rules-cases/data-point-constraint-violation)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/data-point-constraint-violation', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];
      const EXPECTED_ISSUES_QUANTITY = 2;
      const EXPECTED_FILE = 'ddf--datapoints--population--by--country_code-900--year--age.csv';
      const EXPECTED_ISSUES_DATA = [{
        path: EXPECTED_FILE,
        data: {constraints: ['900'], fieldName: 'country_code', fieldValue: '777', line: 1}
      }, {
        path: EXPECTED_FILE,
        data: {constraints: ['900'], fieldName: 'country_code', fieldValue: '901', line: 3}
      }];

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(EXPECTED_ISSUES_QUANTITY);

          issues.forEach((issue, index: number) => {
            expect(issue.path.endsWith(EXPECTED_ISSUES_DATA[index].path)).to.be.true;
            expect(!!issue.data).to.be.true;
            expect(isEqual(issue.data, EXPECTED_ISSUES_DATA[index].data)).to.be.true;
          });

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });

        const customRules = [{
          ruleKey: DATA_POINT_CONSTRAINT_VIOLATION,
          rule: allRules[DATA_POINT_CONSTRAINT_VIOLATION]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });
  });
});

describe('when "DUPLICATED_KEY" rule', () => {
  it('an issue should be found for "fixtures/rules-cases/duplicated-data-point-key"', done => {
    const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/duplicated-data-point-key', null);
    const issueEmitter = new EventEmitter();
    const issues: Issue[] = [];
    const EXPECTED_RESULT = {
      data: [
        {
          "file": "ddf--datapoints--gas_production_bcf--by--geo--year.csv",
          "record": {
            "geo": "algeria",
            "year": "1977",
            "gas_production_bcf": "1.15619237401781"
          },
          "line": 8
        }
      ]
    };

    ddfDataSet.load(() => {
      const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
      const theEnd = () => {
        expect(issues.length).to.equal(1);

        const issue = head(issues);

        expect(isEqual(issue.data, EXPECTED_RESULT.data)).to.be.true;

        done();
      };

      issueEmitter.on('issue', (issue) => {
        issues.push(issue);
      });
      const customRules = [{ruleKey: DUPLICATED_DATA_POINT_KEY, rule: allRules[DUPLICATED_DATA_POINT_KEY]}];

      const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

      dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
    });
  });
});
