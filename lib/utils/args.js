'use strict';

const ROOT_PARAMETER_IS_REQUIRED = 1;
const argv = require('yargs')
  .usage('Usage: $0 <root> [options]')
  .command('root', 'Root directory')
  .demand(ROOT_PARAMETER_IS_REQUIRED)
  .example('$0 ../ddf-example -i', 'generate ddf--index file')
  .describe('i', 'Generate index file')
  .describe('c', 'Console (non UI) output')
  .argv;

exports.getDDFRootFolder = () => argv._[0] || process.cwd();
exports.getSettings = () => {
  const settings = {};

  // todo: change it after ui implementation
  // settings.isUI = !argv.c;

  settings.isUI = !!argv.c;
  settings.isIndexGenerationMode = !!argv.i;
  return settings;
};
