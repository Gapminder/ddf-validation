'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const testUtils = require('./test-utils');
const Db = require('../lib/data/db');

chai.use(sinonChai);

describe('db storage', () => {
  let db = null;

  before(() => {
    db = new Db('', {path: './_results-test'});
  });

  after(done => {
    db.lokiDB.deleteDatabase({}, () => {
      done();
    });
  });

  describe('when correct DDF file', () => {
    const collectionName = 'concepts';
    const path = './test/fixtures/good-folder/ddf--concepts.csv';
    let source = null;
    let target = null;
    let findCollectionError = null;
    let csvToJsonError = null;

    beforeEach(done => {
      db.fillCollection(
        collectionName,
        path,
        err => {
          findCollectionError = err;
          testUtils.csvToJson(path, (_err, _source) => {
            csvToJsonError = _err;
            source = _source;
            target = db.getCollection(collectionName).find();

            done();
          });
        });
    });

    afterEach(() => {
      const coll = db.getCollection(collectionName);

      coll.removeWhere({});
    });

    it('errors should be detected', () => {
      expect(!!findCollectionError).to.be.false;
      expect(!!csvToJsonError).to.be.false;
    });

    it('content should be properly saved', () => {
      target.forEach((targetRecord, rowNumber) => {
        for (const key of Object.keys(source[rowNumber])) {
          expect(source[rowNumber][key]).to.equal(targetRecord[key]);
        }
      });
    });
  });

  describe('when csv file does not exist', () => {
    const collectionName = 'concepts';
    const path = './test/fixtures/good-folder/not-exists.csv';
    let findCollectionError = null;

    beforeEach(done => {
      db.fillCollection(
        collectionName,
        path,
        err => {
          findCollectionError = err;
          done();
        });
    });

    it('error with code `ENOENT` should be raised', () => {
      expect(!!findCollectionError).to.be.true;
      expect(findCollectionError.code).to.equal('ENOENT');
    });
  });
});
