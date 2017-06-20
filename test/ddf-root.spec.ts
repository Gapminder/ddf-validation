import * as chai from 'chai';
import { DDFRoot } from '../src/data/ddf-root';

const expect = chai.expect;

describe('ddf root folder validation', () => {
  describe('when DDF folder (fixtures/good-folder)', () => {
    it('ddf folder should present', done => {
      const ddfRoot = new DDFRoot('./test/fixtures/good-folder', null);

      ddfRoot.check(() => {
        expect(ddfRoot.dataPackageDescriptor).to.be.not.null;
        expect(ddfRoot.fileDescriptors).to.be.not.null;
        expect(ddfRoot.fileDescriptors.length).to.be.greaterThan(0);

        done();
      });
    });
  });
});
