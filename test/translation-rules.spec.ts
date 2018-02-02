import * as chai from 'chai';
import { EventEmitter } from 'events';
import { endsWith, isEqual, head } from 'lodash';
import { DdfDataSet } from '../src/ddf-definitions/ddf-data-set';
import {
  UNEXPECTED_TRANSLATION_HEADER,
  UNEXPECTED_TRANSLATIONS_DATA,
  UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA,
  DUPLICATED_DATA_POINT_TRANSLATION_KEY,
  DUPLICATED_TRANSLATION_KEY
} from '../src/ddf-rules/registry';
import { allRules } from '../src/ddf-rules';
import { Issue } from '../src/ddf-rules/issue';
import { getAllDataPointFileDescriptorsChunks } from "../src/shared";
import { DataPointChunksProcessingStory } from '../src/stories/data-point-chunks-processing';
import { IssuesFilter } from '../src/utils/issues-filter';

const expect = chai.expect;

process.env.SILENT_MODE = true;

const issuesFilter = new IssuesFilter({});

describe('translation rules', () => {
  describe('when "UNEXPECTED_TRANSLATION_HEADER" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/dummy-companies)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies', null);

      ddfDataSet.load(() => {
        const results = allRules[UNEXPECTED_TRANSLATION_HEADER].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`expected issues should be found for folder with the problem
   (fixtures/rules-cases/unexpected-translation-header)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-translation-header', null);

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_LENGTH = 2;
        const results = allRules[UNEXPECTED_TRANSLATION_HEADER].rule(ddfDataSet);
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
          expect(result.type).to.equal(UNEXPECTED_TRANSLATION_HEADER);
          expect(endsWith(result.path, EXPECTED_RESULTS[index].path)).to.be.true;
          expect(isEqual(result.data, EXPECTED_RESULTS[index].data)).to.be.true;
        });

        done();
      });
    });
  });

  describe('when "UNEXPECTED_TRANSLATIONS_DATA" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/dummy-companies)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies', null);

      ddfDataSet.load(() => {
        const results = allRules[UNEXPECTED_TRANSLATIONS_DATA].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`expected issues should be found for folder with the problem
     (fixtures/rules-cases/unexpected-translations-data)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-translations-data', null);

      ddfDataSet.load(() => {
        const results: Issue[] = allRules[UNEXPECTED_TRANSLATIONS_DATA].rule(ddfDataSet);
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

        const result = head(results);

        expect(result.type).to.equal(UNEXPECTED_TRANSLATIONS_DATA);
        expect(endsWith(result.path, EXPECTED_RESULT.path)).to.be.true;
        expect(result.data.record.company).to.equal(EXPECTED_RESULT.data.record.company);
        expect(result.data.record.country).to.equal(EXPECTED_RESULT.data.record.country);
        expect(result.data.primaryKey).to.equal(EXPECTED_RESULT.data.primaryKey);

        done();
      });
    });
  });

  describe('when "UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA" rule', () => {
    it('any issue should NOT be found for "fixtures/dummy-companies"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(0);

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });
        const customRules = [{
          ruleKey: UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA,
          rule: allRules[UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });
  });

  describe('when "UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA" rule', () => {
    it('an issue should be found for "fixtures/rules-cases/unexpected-data-point-translations-data"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/unexpected-data-point-translations-data', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];
      const EXPECTED_RESULT = {
        path: 'lang/nl-nl/ddf--datapoints--company_size_string--by--company--anno.csv',
        data: {
          record: {company: '', anno: '2015', company_size_string: 'groot'},
          primaryKey: ['company', 'anno']
        }
      };

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(1);

          const issue = head(issues);

          expect(endsWith(issue.path, EXPECTED_RESULT.path)).to.be.true;
          expect(isEqual(issue.data, EXPECTED_RESULT.data)).to.be.true;

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });
        const customRules = [{
          ruleKey: UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA,
          rule: allRules[UNEXPECTED_DATA_POINT_TRANSLATIONS_DATA]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });
  });

  describe('when "DUPLICATED_DATA_POINT_TRANSLATION_KEY" rule', () => {
    it('any issue should NOT be found for "fixtures/dummy-companies"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(0);

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });
        const customRules = [{
          ruleKey: DUPLICATED_DATA_POINT_TRANSLATION_KEY,
          rule: allRules[DUPLICATED_DATA_POINT_TRANSLATION_KEY]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });

    it('any issue should NOT be found for "fixtures/companies-nl-ru"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/companies-nl-ru', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];

      ddfDataSet.load(() => {
        const fileDescriptorsChunks = getAllDataPointFileDescriptorsChunks(ddfDataSet);
        const theEnd = () => {
          expect(issues.length).to.equal(0);

          done();
        };

        issueEmitter.on('issue', (issue) => {
          issues.push(issue);
        });
        const customRules = [{
          ruleKey: DUPLICATED_DATA_POINT_TRANSLATION_KEY,
          rule: allRules[DUPLICATED_DATA_POINT_TRANSLATION_KEY]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });
  });

  describe('when "DUPLICATED_TRANSLATION_KEY" rule', () => {
    it('an issue should be found for "fixtures/rules-cases/duplicated-data-point-translation-key"', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/duplicated-data-point-translation-key', null);
      const issueEmitter = new EventEmitter();
      const issues: Issue[] = [];
      const EXPECTED_RESULT = {
        data: [
          {
            file: 'ddf--datapoints--company_size_string--by--company--anno.csv',
            record: {
              company: 'mic',
              anno: '2016',
              company_size_string: 'groot'
            },
            line: 1
          },
          {
            file: 'ddf--datapoints--company_size_string--by--company--anno.csv',
            record: {
              company: 'mic',
              anno: '2016',
              company_size_string: 'groot'
            },
            line: 2
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
        const customRules = [{
          ruleKey: DUPLICATED_DATA_POINT_TRANSLATION_KEY,
          rule: allRules[DUPLICATED_DATA_POINT_TRANSLATION_KEY]
        }];

        const dataPointChunksProcessingStory = new DataPointChunksProcessingStory(fileDescriptorsChunks, issueEmitter);

        dataPointChunksProcessingStory.withCustomRules(customRules).waitForResult(theEnd).processDataPointChunks(ddfDataSet, issuesFilter);
      });
    });
  });

  describe('when "DUPLICATED_TRANSLATION_KEY" rule', () => {
    it('any issue should NOT be found for folder without the problem (fixtures/dummy-companies-with-dp)', done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/dummy-companies', null);

      ddfDataSet.load(() => {
        const results = allRules[DUPLICATED_TRANSLATION_KEY].rule(ddfDataSet);

        expect(results.length).to.equal(0);

        done();
      });
    });

    it(`expected issues should be found for folder with the problem
   (fixtures/rules-cases/unexpected-translation-header)`, done => {
      const ddfDataSet = new DdfDataSet('./test/fixtures/rules-cases/duplicated-translation-key', null);

      ddfDataSet.load(() => {
        const EXPECTED_ISSUES_LENGTH = 2;
        const results = allRules[DUPLICATED_TRANSLATION_KEY].rule(ddfDataSet);
        const EXPECTED_RESULTS = [{
          path: 'lang/nl-nl/ddf--entities--company.csv',
          data: ['gap']
        }, {
          path: 'lang/nl-nl/ddf--entities--region.csv',
          data: ['america']
        }];

        expect(results.length).to.equal(EXPECTED_ISSUES_LENGTH);

        results.forEach((result, index) => {
          expect(result.type).to.equal(DUPLICATED_TRANSLATION_KEY);
          expect(endsWith(result.path, EXPECTED_RESULTS[index].path)).to.be.true;
          expect(isEqual(result.data, EXPECTED_RESULTS[index].data)).to.be.true;
        });

        done();
      });
    });
  });
});
