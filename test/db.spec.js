'use strict';
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const testUtils = require('./test-utils');
chai.use(sinonChai);

const Db = require('../lib/data/db');

describe('db storage', () => {
  let db;

  before(() => {
    db = new Db('', {path: './_results-test'});
  });

  after(done => {
    db.inst.deleteDatabase({}, () => {
      done();
    });
  });

  describe(`when good data`, () => {
    const collectionName = 'concepts';
    const path = './test/fixtures/good-folder/ddf--concepts.csv';
    let source, target, findCollectionError, csvToJsonError;

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
      for (let i = 0; i < target.length; i++) {
        for (let key of Object.keys(source[i])) {
          expect(source[i][key]).to.equal(target[i][key]);
        }
      }
    });
  });

  describe(`when csv file does not exist`, () => {
    const collectionName = 'concepts';
    const path = './test/fixtures/good-folder/not-exists.csv';
    let findCollectionError;

    beforeEach(done => {
      db.fillCollection(
        collectionName,
        path,
        err => {
          findCollectionError = err;
          done();
        });
    });

    it(`error with code 'ENOENT' should be raised`, () => {
      expect(!!findCollectionError).to.equal(true);
      expect(findCollectionError.code).to.equal('ENOENT');
    });
  });
});
