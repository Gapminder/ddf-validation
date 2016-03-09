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
    db.inst.deleteDatabase({}, () => {
      done();
    });
  });

  describe('when good data', () => {
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

      while (coll.data[0]) {
        coll.remove(coll.data[0]);
      }
    });

    it('any error should be null or undefined', () => {
      expect(!!findCollectionError).to.equal(false);
      expect(!!csvToJsonError).to.equal(false);
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
      expect(!!findCollectionError).to.equal(true);
      expect(findCollectionError.code).to.equal('ENOENT');
    });
  });
});
