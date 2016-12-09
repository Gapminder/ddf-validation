import * as chai from 'chai';
import {getRulesInformation} from '../src/ddf-rules/registry';

const expect = chai.expect;

describe('rules registry', () => {
  it('information about rules should be defined', done => {
    expect(!!getRulesInformation()).to.be.true;

    done();
  });
});
