'use strict';

const ROOT_PARAMETER_IS_REQUIRED = 1;
const argv = require('yargs')
  .usage('Usage: $0 <root> [options]')
  .command('root', 'Root directory')
  .demand(ROOT_PARAMETER_IS_REQUIRED)
  .example('$0 ../ddf-example -d year', 'check "ddf-example" directory with data points checking')
  .describe('d', 'Dimension for gaps checking in data points')
  .describe('c', 'Console (non UI) output')
  .argv;

exports.getDDFRootFolder = () => argv._[0] || process.cwd();
exports.getSettings = () => {
  const settings = {};

  settings.gapsSupportDimensions = typeof argv.d === 'string' ? [argv.d] : argv.d;
  settings.isUI = !argv.c;
  return settings;
};
