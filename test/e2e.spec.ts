import * as chai from 'chai';
import { head, isArray } from 'lodash';
import { exec } from 'child_process';

const expect = chai.expect;

export const expectedWringCsvData = [
  {
    message: 'Too few fields: expected 3 fields but parsed 2',
    row: 13,
    type: 'FieldMismatch/TooFewFields',
    data: {
      tag: 'housing',
      name: ' Housing'
    }
  },
  {
    message: 'Too few fields: expected 3 fields but parsed 2',
    row: 14,
    type: 'FieldMismatch/TooFewFields',
    data: {
      tag: 'cars',
      name: ' Cars'
    }
  },
  {
    message: 'Too few fields: expected 3 fields but parsed 2',
    row: 15,
    type: 'FieldMismatch/TooFewFields',
    data: {
      tag: 'other',
      name: ' Other variables'
    }
  }
];


function execute(command, callback) {
  exec(command, function (error, stdout, stderr) {
    callback(error, stdout, stderr);
  });
}

describe('e2e', () => {
  describe('--ws flag', () => {
    it('any issue should NOT be found when "--ws" flag is OFF and DS contains WS based issue', done => {
      execute('./src/cli.js ./test/fixtures/rules-cases/entity-value-as-entity-name --silent', (error, stdout, stderr) => {
        expect(!!error).to.be.false;
        expect(!!stdout).to.be.false;
        expect(!!stderr).to.be.false;

        done();
      });
    });

    it('an issue should be found when "--ws" flag is ON and DS contains WS based issue', done => {
      execute('./src/cli.js ./test/fixtures/rules-cases/entity-value-as-entity-name --silent --ws', (error, stdout, stderr) => {
        expect(!!error).to.be.true;
        expect(error.code).to.be.equal(1);
        expect(!!stdout).to.be.true;

        const issues = JSON.parse(stdout);
        const issue: { id: string } = <{ id: string }>head(issues);

        expect(issues.length).to.be.equals(1);
        expect(issue.id).to.be.equals('ENTITY_VALUE_AS_ENTITY_NAME');
        expect(!!stderr).to.be.false;

        done();
      });
    });
  });

  describe('-a flag', () => {
    it('any issue should NOT be found when "-a" flag is OFF and DS contains WS based issue', done => {
      execute('./src/cli.js ./test/fixtures/good-folder-dp --silent', (error, stdout, stderr) => {
        expect(!!error).to.be.false;
        expect(!!stdout).to.be.false;
        expect(!!stderr).to.be.false;

        done();
      });
    });

    it('an issue should be found when "-a" flag is ON and DS contains WS based issue', done => {
      execute('./src/cli.js ./test/fixtures/outdated-datapackage --silent -a', (error, stdout, stderr) => {
        expect(!!error).to.be.false;
        expect(stdout).to.be.equal("datapackage is not actual: more details:\n[\n  \"gas_production_bcf--by--geo--year\"\n]\n");

        done();
      });
    });
  });

  describe('csv errors', () => {
    it('an attempt to validate ds with wrong csv file', done => {
      execute('./src/cli.js ./test/fixtures/wrong-csv --silent', (error, stdout) => {
        expect(!!error).to.be.true;

        const issueDetails = JSON.parse(stdout);

        expect(isArray(issueDetails)).to.be.true;

        const issue: any = head(issueDetails);

        expect(issue.id).to.be.equal('UNEXPECTED_DATA');
        expect(issue.path).to.be.contains('ddf--entities--tag.csv');
        expect(issue.data).to.be.deep.equal(expectedWringCsvData);

        done();
      });
    });

    it('an attempt to create datapackage on ds with wrong csv file', done => {
      execute('./src/cli.js ./test/fixtures/wrong-csv -i', (error, stdout) => {
        expect(!!error).to.be.true;

        const messageStartMarker = 'datapackage.json was NOT created: ';
        const pos = stdout.indexOf(messageStartMarker);

        const messageContent = stdout.substring(pos + messageStartMarker.length, stdout.length - 2);
        const issueDetails = JSON.parse(messageContent);

        expect(isArray(issueDetails)).to.be.true;

        const issue: any = head(issueDetails);

        expect(issue.file).to.be.contains('ddf--entities--tag.csv');
        expect(issue.csvChecker.errors).to.be.deep.equal(expectedWringCsvData);

        done();
      });
    });
  });
});
