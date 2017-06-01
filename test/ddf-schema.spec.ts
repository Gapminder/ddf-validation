import * as chai from 'chai';
import { DataPackage } from '../src/data/data-package';
import { getDdfSchema } from '../src/data/ddf-schema';

const expect = chai.expect;

describe('ddf schema creation', () => {
  it('for dummy-companies', done => {
    const dataPackage = new DataPackage('./test/fixtures/ddf-schema', {});

    dataPackage.take(() => {
      getDdfSchema(dataPackage, {}, (ddfSchema: any) => {
        expect(ddfSchema.concepts).to.not.be.null;
        expect(ddfSchema.concepts.length).to.be.gt(0);

        expect(ddfSchema.entities).to.not.be.null;
        expect(ddfSchema.entities.length).to.be.gt(0);

        expect(ddfSchema.datapoints).to.not.be.null;
        expect(ddfSchema.datapoints.length).to.be.gt(0);

        done();
      });
    }, true);
  });
});
