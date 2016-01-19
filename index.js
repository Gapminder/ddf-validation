'use strict';

const pathNormilize = require('./utils/path-normilize');
// from args
let folder = '~/work/gapminder/open-numbers/ddf--gapminder--systema_globalis';
// normalize path
var normFolder = pathNormilize(folder);
// folder validation
var ddfFolderValidation = require('./lib/ddf-folder-validation');

if (ddfFolderValidation(normFolder)) {
  console.log('mission complete');
}
