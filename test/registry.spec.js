'use strict';
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const rulesRegistry = require('../lib/ddf-rules/registry');

chai.use(sinonChai);

describe('rules registry', () => {
  it('information about rules should be defined', done => {
    expect(!!rulesRegistry.getRulesInformation()).to.be.true;

    done();
  });
});
