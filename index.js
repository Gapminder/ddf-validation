#! /usr/bin/env node
'use strict';

const utils = require('./lib/utils');
const DDFRoot = require('./lib/files/root');
const ddfRoot = new DDFRoot(utils.ddfRootFolder);
ddfRoot.check(() => {

  ddfRoot.getDdfDirectoriesDescriptors().forEach(d => {
    console.log(`${d.dir} ${d.isEmpty} ${d.isDDF}`);
  });
});
