'use strict';

const _ = require('lodash');
const ROOT_PARAMETER_IS_REQUIRED = 1;
const argv = require('yargs')
  .usage('Usage: $0 <root> [options]')
  .command('root', 'Root directory')
  .demand(ROOT_PARAMETER_IS_REQUIRED)
  .example('$0 ../ddf-example', 'validate DDF datasets for the root')
  .example('$0 ../ddf-example -i', 'generate ddf--index file')
  .example('$0 ../ddf-example -j', 'fix JSONs for this DDF dataset')
  .describe('i', 'Generate index file')
  .describe('j', 'Fix wrong JSONs')
  .argv;

exports.getDDFRootFolder = () => _.head(argv._) || process.cwd();
exports.getSettings = () => {
  const settings = {};

  // settings.isUI = !argv.c;

  settings.isUI = !!argv.c;
  settings.isIndexGenerationMode = !!argv.i;
  settings.isJsonAutoCorrectionMode = !!argv.j;
  return settings;
};
